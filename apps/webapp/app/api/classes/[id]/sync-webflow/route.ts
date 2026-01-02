import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { createWebflowClassItem, updateWebflowClassItem, getWebflowConfig } from '@/lib/webflow';
import { getCurrentAdmin, insertLog } from '@/lib/logging';
import type { Class } from '@/lib/classes';

export const runtime = 'nodejs';

export async function POST(
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

    // Fetch the class data
    const { data: classData, error: getError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (getError || !classData) {
      console.error('[API] Error fetching class:', getError);
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Look up the course/program to determine program_type and get wf_class_link
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('program_type, wf_class_link')
      .eq('id', classData.course_uuid)
      .single();

    if (courseError) {
      console.error('[API] Error fetching course:', courseError);
      return NextResponse.json(
        { success: false, error: `Course lookup failed: ${courseError.message}` },
        { status: 500 }
      );
    }

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found for this class' },
        { status: 404 }
      );
    }

    const programType = course.program_type || null;
    const webflowConfig = getWebflowConfig(programType);

    if (!webflowConfig) {
      return NextResponse.json(
        { success: false, error: 'Webflow configuration not available. Please check environment variables.' },
        { status: 500 }
      );
    }

    const isProgram = programType === 'program';
    const existingWebflowItemId = classData.webflow_item_id;
    
    // Ensure wf_class_link is from course
    const classDataForWebflow: Class = {
      ...classData as Class,
      wf_class_link: course.wf_class_link || classData.wf_class_link || null,
    };

    // Try to update if webflow_item_id exists
    if (existingWebflowItemId) {
      try {
        console.log('[API] Attempting to update existing Webflow item:', existingWebflowItemId);
        const { success, error: updateError } = await updateWebflowClassItem(
          webflowConfig,
          existingWebflowItemId,
          classDataForWebflow,
          isProgram
        );

        if (success) {
          console.log('[API] Successfully updated Webflow item');
          // Publish the updated item
          try {
            const { WebflowClient } = await import('webflow-api');
            const webflow = new WebflowClient({ accessToken: webflowConfig.apiToken });
            await webflow.collections.items.publishItem(webflowConfig.collectionId, {
              itemIds: [existingWebflowItemId],
            });
            console.log('[API] Published updated Webflow item');
          } catch (publishError: any) {
            console.warn('[API] Failed to publish updated item (non-critical):', publishError);
          }

          // Log the sync action
          await insertLog({
            admin_user_id: admin.id,
            reference_id: classId,
            reference_type: 'class',
            action_type: 'webflow_synced',
            new_value: 'updated',
            class_id: classId,
          });

          return NextResponse.json({
            success: true,
            message: 'Class synced to Webflow successfully',
            action: 'updated',
            webflowItemId: existingWebflowItemId,
          });
        } else {
          // Update failed - item might have been deleted in Webflow
          console.log('[API] Update failed, will try to create new item:', updateError);
        }
      } catch (updateError: any) {
        // Update failed - item might have been deleted in Webflow
        console.log('[API] Update exception, will try to create new item:', updateError);
      }
    }

    // Create new Webflow item (either doesn't exist or update failed)
    console.log('[API] Creating new Webflow item');
    const { webflowItemId, error: createError } = await createWebflowClassItem(
      webflowConfig,
      classDataForWebflow,
      isProgram
    );

    if (createError || !webflowItemId) {
      return NextResponse.json(
        { success: false, error: createError || 'Failed to create Webflow item' },
        { status: 500 }
      );
    }

    // Update the class with the new webflow_item_id and wf_class_link
    const { error: updateDbError } = await supabase
      .from('classes')
      .update({ 
        webflow_item_id: webflowItemId,
        wf_class_link: course.wf_class_link || null,
      })
      .eq('id', classId);

    if (updateDbError) {
      console.error('[API] Failed to update webflow_item_id in database:', updateDbError);
      // Don't fail the whole operation - Webflow item was created successfully
    }

    // Log the sync action
    const syncAction = existingWebflowItemId ? 'recreated' : 'created';
    await insertLog({
      admin_user_id: admin.id,
      reference_id: classId,
      reference_type: 'class',
      action_type: 'webflow_synced',
      new_value: syncAction,
      class_id: classId,
    });

    return NextResponse.json({
      success: true,
      message: 'Class synced to Webflow successfully',
      action: syncAction,
      webflowItemId,
    });
  } catch (error: any) {
    console.error('Error in sync Webflow API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

