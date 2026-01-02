import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { updateWebflowClassItem, getWebflowConfig } from '@/lib/webflow';
import { getCurrentAdmin, insertLog } from '@/lib/logging';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Maps Supabase/PostgREST errors to user-friendly messages
 */
function mapDatabaseError(error: PostgrestError | Error, context: string = ""): string {
  const errorMessage = error.message?.toLowerCase() || "";
  const errorCode = (error as PostgrestError).code;

  // Handle "Cannot coerce the result to a single JSON object"
  if (errorMessage.includes("cannot coerce") || errorMessage.includes("coerce the result")) {
    if (context.includes("class")) {
      return "This class doesn't exist or may have been removed.";
    }
    if (context.includes("course")) {
      return "This course doesn't exist or may have been removed.";
    }
    return "We couldn't find what you're looking for.";
  }

  // Handle PGRST116 - No rows returned
  if (errorCode === "PGRST116" || errorMessage.includes("no rows returned")) {
    if (context.includes("class")) {
      return "This class doesn't exist or may have been removed.";
    }
    if (context.includes("course")) {
      return "This course doesn't exist or may have been removed.";
    }
    return "We couldn't find what you're looking for.";
  }

  // Return original message for other errors
  return error.message || "Something went wrong. Please try again.";
}

/**
 * Server-side API route to update a class in Supabase and sync to Webflow
 * Requires authentication
 */
export async function PUT(
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

    // Parse request body
    const body = await request.json();
    const {
      enrollmentStart,
      enrollmentClose,
      classStartDate,
      classCloseDate,
      isOnline,
      programmingOffering,
      classImage,
      lengthOfClass,
      certificationLength,
      registrationLimit,
      price,
      registrationFee,
      location,
      className,
    } = body;

    // First, get the current class to check for webflow_item_id and course_uuid
    const { data: currentClass, error: fetchError } = await supabase
      .from('classes')
      .select('id, webflow_item_id, course_uuid, class_name, course_code, class_id')
      .eq('id', classId)
      .single();

    if (fetchError || !currentClass) {
      return NextResponse.json(
        { success: false, error: mapDatabaseError(fetchError || new Error('Class not found'), "class") },
        { status: 404 }
      );
    }

    // Build update data object
    const updateData: any = {};
    if (enrollmentStart !== undefined) updateData.enrollment_start = enrollmentStart;
    if (enrollmentClose !== undefined) updateData.enrollment_close = enrollmentClose;
    if (classStartDate !== undefined) updateData.class_start_date = classStartDate;
    if (classCloseDate !== undefined) updateData.class_close_date = classCloseDate;
    if (isOnline !== undefined) updateData.is_online = isOnline;
    if (programmingOffering !== undefined) updateData.programming_offering = programmingOffering;
    if (classImage !== undefined) updateData.class_image = classImage;
    if (lengthOfClass !== undefined) updateData.length_of_class = lengthOfClass;
    if (certificationLength !== undefined) updateData.certification_length = certificationLength;
    if (registrationLimit !== undefined) updateData.registration_limit = registrationLimit;
    if (price !== undefined) updateData.price = price;
    if (registrationFee !== undefined) updateData.registration_fee = registrationFee;
    if (location !== undefined) updateData.location = location;
    if (className !== undefined) updateData.class_name = className;

    // Update class in Supabase
    const { data: updatedClass, error: updateError } = await supabase
      .from('classes')
      .update(updateData)
      .eq('id', classId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating class in Supabase:', updateError);
      return NextResponse.json(
        { success: false, error: mapDatabaseError(updateError, "class") },
        { status: 500 }
      );
    }

    // Sync to Webflow if webflow_item_id exists
    let webflowError: string | null = null;
    if (currentClass.webflow_item_id) {
      console.log('[API] Starting Webflow sync for class update:', classId);
      try {
        // Look up the course/program to determine program_type
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('program_type')
          .eq('id', currentClass.course_uuid)
          .single();
        
        if (courseError) {
          console.error('[API] Error fetching course:', courseError);
          webflowError = `Course lookup failed: ${mapDatabaseError(courseError, "course")}`;
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
            
            // Use the updated class data for Webflow sync
            const { success, error: wfError } = await updateWebflowClassItem(
              webflowConfig,
              currentClass.webflow_item_id,
              updatedClass
            );

            if (!success) {
              console.error('[API] Webflow sync failed:', wfError);
              webflowError = `Webflow API error: ${wfError || 'Unknown error'}`;
            } else {
              console.log('[API] Webflow item updated successfully');
            }
          }
        } else {
          console.error('[API] Course not found for courseUuid:', currentClass.course_uuid);
          webflowError = `Course not found: ${currentClass.course_uuid}`;
        }
      } catch (webflowErr: any) {
        // Log error but don't fail class update
        console.error('[API] Exception during Webflow sync:', webflowErr);
        console.error('[API] Error stack:', webflowErr.stack);
        webflowError = `Exception: ${webflowErr.message}`;
      }
    } else {
      console.log('[API] No webflow_item_id found, skipping Webflow sync');
    }

    // Log class update
    try {
      const { admin } = await getCurrentAdmin(user.id);
      if (admin) {
        await insertLog({
          admin_user_id: admin.id,
          reference_id: classId,
          reference_type: 'class',
          action_type: 'class_updated',
          class_id: classId,
        });
      }
    } catch (logError: any) {
      // Log error but don't fail class update
      console.error('[API] Failed to log class update:', logError);
    }

    return NextResponse.json({
      success: true,
      class: updatedClass,
      webflowSync: {
        success: webflowError === null,
        error: webflowError,
      },
    });
  } catch (error: any) {
    console.error('Error in update class API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

