import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 requires params to be a Promise
    const params = await context.params;
    const classId = params.id;

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

    if (!classId) {
      return NextResponse.json(
        { success: false, error: 'Missing class ID' },
        { status: 400 }
      );
    }

    // Verify the class exists (including already-deleted ones, for idempotency)
    const { data: existingClass, error: getError } = await supabase
      .from('classes')
      .select('id, deleted_at')
      .eq('id', classId)
      .maybeSingle();

    if (getError || !existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    if (existingClass.deleted_at) {
      return NextResponse.json({
        success: true,
        alreadyDeleted: true,
        message: 'Class was already deleted',
      });
    }

    // Soft delete: hide the class everywhere but keep all history
    // (logs, enrollments, transactions).
    const { error: deleteError } = await supabase
      .from('classes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', classId)
      .is('deleted_at', null);

    if (deleteError) {
      console.error('Error deleting class:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message || 'Failed to delete class' },
        { status: 500 }
      );
    }

    // Log the deletion
    await insertLog({
      admin_user_id: admin.id,
      reference_id: classId,
      reference_type: 'class',
      action_type: 'class_deleted',
    });

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in delete class API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



