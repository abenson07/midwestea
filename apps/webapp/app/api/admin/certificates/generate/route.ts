import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { issueCertificate } from '@/lib/certificates/issue';

export const runtime = 'nodejs';

/**
 * POST /api/admin/certificates/generate — Generate + issue a certificate for
 * one or more enrollments (admin only). Single-select passes one enrollment
 * id; bulk passes many, sharing one issuedAt/duration confirmation.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found. Please ensure you are registered as an admin.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const enrollmentIds: unknown = body?.enrollmentIds;
    const issuedAt: unknown = body?.issuedAt;
    const durationYearsOverride: unknown = body?.durationYearsOverride;

    if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0 || !enrollmentIds.every((id) => typeof id === 'string')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid required field: enrollmentIds' },
        { status: 400 }
      );
    }
    if (typeof issuedAt !== 'string' || !issuedAt) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: issuedAt' },
        { status: 400 }
      );
    }
    if (durationYearsOverride !== undefined && durationYearsOverride !== null && typeof durationYearsOverride !== 'number') {
      return NextResponse.json(
        { success: false, error: 'durationYearsOverride must be a number' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      enrollmentIds.map((enrollmentId) =>
        issueCertificate(
          {
            enrollmentId,
            issuedAt,
            durationYearsOverride: durationYearsOverride ?? null,
            adminId: admin.id,
          },
          supabase
        )
      )
    );

    return NextResponse.json({
      success: results.every((row) => row.success),
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in admin/certificates/generate API:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
