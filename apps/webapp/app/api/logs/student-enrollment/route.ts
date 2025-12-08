import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const body = await request.json();
    const {
      student_id,
      class_id,
      action,
    } = body;

    // Validate required fields
    if (!student_id || !class_id || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: student_id, class_id, action' },
        { status: 400 }
      );
    }

    // Validate action
    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "add" or "remove"' },
        { status: 400 }
      );
    }

    const actionType = action === 'add' ? 'student_added' : 'student_removed';

    // Insert log entry
    const result = await insertLog({
      admin_user_id: admin.id,
      reference_id: class_id,
      reference_type: 'class',
      action_type: actionType,
      student_id,
      class_id,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to log student enrollment action' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Error in student-enrollment log API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

