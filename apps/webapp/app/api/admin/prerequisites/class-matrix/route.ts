import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { getClassPrerequisiteMatrix } from '@/lib/admin-prerequisites';

export const runtime = 'nodejs';

/**
 * GET /api/admin/prerequisites/class-matrix?classId=<uuid>
 *
 * Class-wide roster view of prerequisite state, one evaluation per enrolled
 * student. Requires a valid session token AND admins table membership.
 */
export async function GET(request: NextRequest) {
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

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const classId = request.nextUrl.searchParams.get('classId');
    if (!classId) {
      return NextResponse.json({ success: false, error: 'classId is required' }, { status: 400 });
    }

    const { payload, error } = await getClassPrerequisiteMatrix(supabase, classId);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, payload });
  } catch (error: any) {
    console.error('[API] Error in prerequisites class-matrix route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
