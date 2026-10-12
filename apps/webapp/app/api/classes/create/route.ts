import { NextRequest, NextResponse, after } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';
import { snapshotClassPrerequisites } from '@/lib/class-prerequisites';
import { notifyWaitlistForClass, type WaitlistClass } from '@/lib/waitlist-notifications';
import { logServerError } from '@/lib/error-reporting/log-server-error';
import type { PostgrestError } from '@supabase/supabase-js';

export const maxDuration = 60;

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
 * Server-side API route to create a class in Supabase.
 * Requires authentication
 */
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

    // Parse request body
    const body = await request.json();
    const {
      courseUuid,
      className,
      courseCode,
      classId,
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
      productId,
      location,
      locationId,
      chargeFullAmountAtRegistration,
    } = body;

    // Validate required fields
    if (!courseUuid || !className || !courseCode || !classId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: courseUuid, className, courseCode, classId' },
        { status: 400 }
      );
    }

    // Fetch course to get wf_class_link
    const { data: courseData, error: courseFetchError } = await supabase
      .from('courses')
      .select('wf_class_link')
      .eq('id', courseUuid)
      .single();

    const wfClassLink = courseData?.wf_class_link || null;

    // Resolve locationId to location_id + location (name)
    let locationIdResolved: string | null = null;
    let locationNameResolved: string | null = location || null;
    if (locationId && typeof locationId === 'string' && locationId.trim()) {
      const { data: loc, error: locErr } = await supabase
        .from('locations')
        .select('id, location_name')
        .eq('id', locationId.trim())
        .single();
      if (!locErr && loc) {
        locationIdResolved = loc.id;
        locationNameResolved = loc.location_name || null;
      }
    }

    // Create class in Supabase
    const { data: classData, error: insertError } = await supabase
      .from('classes')
      .insert({
        course_uuid: courseUuid,
        class_name: className,
        course_code: courseCode,
        class_id: classId,
        enrollment_start: enrollmentStart || null,
        enrollment_close: enrollmentClose || null,
        class_start_date: classStartDate || null,
        class_close_date: classCloseDate || null,
        is_online: isOnline || false,
        programming_offering: programmingOffering || null,
        class_image: classImage || null,
        length_of_class: lengthOfClass || null,
        certification_length: certificationLength || null,
        registration_limit: registrationLimit || null,
        price: price || null,
        registration_fee: registrationFee || null,
        product_id: productId || null,
        location: locationNameResolved,
        location_id: locationIdResolved,
        wf_class_link: wfClassLink,
        charge_full_amount_at_registration: chargeFullAmountAtRegistration === true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating class in Supabase:', insertError);
      return NextResponse.json(
        { success: false, error: mapDatabaseError(insertError, "class") },
        { status: 500 }
      );
    }

    // Snapshot the template's prerequisites onto the new class. Non-fatal:
    // a class without its snapshot is recoverable; a failed class creation
    // after Stripe setup is not.
    try {
      const { count, error: snapshotError } = await snapshotClassPrerequisites(
        supabase,
        classData.id,
        courseUuid
      );
      if (snapshotError) {
        console.error('[API] Failed to snapshot class prerequisites:', snapshotError);
      } else {
        console.log('[API] Snapshotted class prerequisites:', { class_id: classData.id, count });
      }
    } catch (snapshotError: any) {
      console.error('[API] Exception snapshotting class prerequisites:', snapshotError);
    }

    // Log class creation (for class detail page, course detail page, and program detail page)
    let courseProgramType: string | null = null;
    try {
      const { data: course } = await supabase
        .from('courses')
        .select('program_type')
        .eq('id', courseUuid)
        .single();
      courseProgramType = course?.program_type || null;
    } catch {
      // Non-fatal if course lookup fails for logging
    }

    try {
      const { admin } = await getCurrentAdmin(user.id);
      if (admin) {
        // Log for class detail page
        await insertLog({
          admin_user_id: admin.id,
          reference_id: classData.id,
          reference_type: 'class',
          action_type: 'class_created',
          class_id: classData.id,
        });
        
        // Also log for course/program detail page
        // Use the program_type we already fetched
        if (courseProgramType === 'program') {
          // Log for program detail page
          await insertLog({
            admin_user_id: admin.id,
            reference_id: courseUuid,
            reference_type: 'program',
            action_type: 'class_created',
            class_id: classData.id,
          });
        } else {
          // Log for course detail page
          await insertLog({
            admin_user_id: admin.id,
            reference_id: courseUuid,
            reference_type: 'course',
            action_type: 'class_created',
            class_id: classData.id,
          });
        }
      }
    } catch (logError: any) {
      // Log error but don't fail class creation
      console.error('[API] Failed to log class creation:', logError);
    }

    // Tell the course's waitlist that registration is open. Runs after the
    // response so the admin isn't kept waiting; a class whose enrollment opens
    // later is picked up by the daily cron (app/api/cron/waitlist-opens).
    after(async () => {
      try {
        const result = await notifyWaitlistForClass(classData as WaitlistClass, { maxSends: 60 });
        console.log('[API] Waitlist notified for new class:', result);
      } catch (notifyError: any) {
        console.error('[API] Failed to notify waitlist for new class:', notifyError);
        void logServerError({
          message: notifyError.message,
          stack: notifyError.stack,
          requestUrl: '/api/classes/create',
          statusCode: 500,
          context: { route: 'classes/create', step: 'notify_waitlist', classId: classData.class_id },
        });
      }
    });

    return NextResponse.json({
      success: true,
      class: classData,
    });
  } catch (error: any) {
    console.error('Error in create class API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

