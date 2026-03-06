import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 requires params to be a Promise
    const params = await context.params;
    const studentId = params.id;

    // Get the authorization header (Bearer token from Supabase session)
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();
    
    // Verify the session token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    // Get current admin using the verified user ID
    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found. Please ensure you are registered as an admin.' },
        { status: 403 }
      );
    }

    // Get the auth user's email using admin client
    const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(studentId);

    if (!getUserError && authUser?.user?.email) {
      return NextResponse.json({
        success: true,
        email: authUser.user.email,
      });
    }

    // Fallback: student may exist in DB without Auth user (e.g. created before Auth sync)
    const { data: studentRow, error: studentError } = await supabase
      .from('students')
      .select('email')
      .eq('id', studentId)
      .maybeSingle();

    if (!studentError && studentRow?.email) {
      return NextResponse.json({
        success: true,
        email: studentRow.email,
      });
    }

    if (getUserError) {
      console.error('[students/email] Auth getUserById error:', getUserError.message);
    }
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error in get-email API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

