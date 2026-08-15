import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { assertClassMaterialAccess } from '@/lib/class-access';

export const runtime = 'nodejs';

/**
 * GET /api/classes/[id]/materials
 *
 * Server-side enforcement of class-material access. The student is always
 * derived from the verified bearer token -- never accepted from the query
 * or body. Returns `access` on every outcome, including denials, so the
 * UI can explain the block. `materialsUrl` is null on every denial.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { id: classId } = await params;

    const { access, error } = await assertClassMaterialAccess(supabase, user.id, classId);

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, access });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to evaluate class material access' },
      { status: 500 }
    );
  }
}
