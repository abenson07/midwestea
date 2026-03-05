import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';

export const runtime = 'nodejs';

/**
 * GET /api/students
 * Returns all students with email from auth (admin-only).
 * Use this for the students list so the UI gets emails in one request.
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

    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (studentsError) {
      return NextResponse.json(
        { success: false, error: studentsError.message },
        { status: 500 }
      );
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        students: [],
      });
    }

    const emailMap: Record<string, string> = {};
    await Promise.all(
      students.map(async (s) => {
        const { data: authUser } = await supabase.auth.admin.getUserById(s.id);
        if (authUser?.user?.email) {
          emailMap[s.id] = authUser.user.email;
        }
      })
    );

    const studentsWithEmail = students.map((s) => ({
      ...s,
      name: s.full_name || 'Unknown Student',
      email: emailMap[s.id] ?? s.email ?? null,
    }));

    return NextResponse.json({
      success: true,
      students: studentsWithEmail,
    });
  } catch (err: unknown) {
    console.error('[GET /api/students] Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
