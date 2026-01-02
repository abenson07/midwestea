import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { deleteWebflowClassItem, getWebflowConfig } from '@/lib/webflow';
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

    // First, verify the class exists and get webflow_item_id and course_uuid
    const { data: existingClass, error: getError } = await supabase
      .from('classes')
      .select('id, class_id, class_name, webflow_item_id, course_uuid')
      .eq('id', classId)
      .single();

    if (getError || !existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Delete from Webflow if webflow_item_id exists
    let webflowError: string | null = null;
    if (existingClass.webflow_item_id) {
      console.log('[API] Starting Webflow deletion for class:', classId);
      try {
        // Look up the course/program to determine program_type
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('program_type')
          .eq('id', existingClass.course_uuid)
          .single();
        
        if (courseError) {
          console.error('[API] Error fetching course:', courseError);
          webflowError = `Course lookup failed: ${courseError.message}`;
        } else if (course) {
          console.log('[API] Found course with program_type:', course.program_type);
          const webflowConfig = getWebflowConfig(course.program_type);

          if (!webflowConfig) {
            const envStatus = {
              apiToken: process.env.WEBFLOW_API_TOKEN ? 'SET' : 'MISSING',
              siteId: process.env.WEBFLOW_SITE_ID ? 'SET' : 'MISSING',
              collectionId: course.program_type === 'program' 
                ? (process.env.WEBFLOW_PROGRAMS_COLLECTION_ID ? 'SET' : 'MISSING')
                : (process.env.WEBFLOW_COURSES_COLLECTION_ID ? 'SET' : 'MISSING'),
            };
            console.error('[API] Webflow config is null. Environment variables:', envStatus);
            webflowError = `Webflow config missing. Check: ${JSON.stringify(envStatus)}`;
          } else {
            console.log('[API] Webflow config created, collectionId:', webflowConfig.collectionId);
            
            const { success, error: wfError } = await deleteWebflowClassItem(
              webflowConfig,
              existingClass.webflow_item_id
            );

            if (!success) {
              console.error('[API] Webflow deletion failed:', wfError);
              webflowError = `Webflow API error: ${wfError || 'Unknown error'}`;
            } else {
              console.log('[API] Webflow item deleted successfully');
            }
          }
        } else {
          console.error('[API] Course not found for courseUuid:', existingClass.course_uuid);
          webflowError = `Course not found: ${existingClass.course_uuid}`;
        }
      } catch (webflowErr: any) {
        // Log error but don't fail class deletion
        console.error('[API] Exception during Webflow deletion:', webflowErr);
        console.error('[API] Error stack:', webflowErr.stack);
        webflowError = `Exception: ${webflowErr.message}`;
      }
    } else {
      console.log('[API] No webflow_item_id found, skipping Webflow deletion');
    }

    // Delete the class from Supabase
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

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
      webflowSync: {
        success: webflowError === null,
        error: webflowError,
      },
    });
  } catch (error: any) {
    console.error('Error in delete class API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



