import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';

export const runtime = 'nodejs';

interface FieldChange {
  field_name: string;
  old_value: string | null;
  new_value: string | null;
}

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
      reference_id,
      reference_type,
      field_changes,
      batch_id,
    } = body;

    // Validate required fields
    if (!reference_id || !reference_type || !Array.isArray(field_changes) || field_changes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: reference_id, reference_type, field_changes' },
        { status: 400 }
      );
    }

    // Validate reference_type
    if (!['program', 'course', 'class', 'student'].includes(reference_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reference_type. Must be one of: program, course, class, student' },
        { status: 400 }
      );
    }

    // Insert one log entry per changed field
    const logResults = [];
    for (const change of field_changes as FieldChange[]) {
      const result = await insertLog({
        admin_user_id: admin.id,
        reference_id,
        reference_type,
        action_type: 'detail_updated',
        field_name: change.field_name,
        old_value: change.old_value,
        new_value: change.new_value,
        batch_id: batch_id || null,
      });
      logResults.push(result);
    }

    // Check if any logs failed
    const failedLogs = logResults.filter(r => !r.success);
    if (failedLogs.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to log some changes: ${failedLogs[0].error}`,
          logged: logResults.length - failedLogs.length,
          failed: failedLogs.length,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logged: logResults.length,
    });
  } catch (error: any) {
    console.error('Error in detail-update log API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

