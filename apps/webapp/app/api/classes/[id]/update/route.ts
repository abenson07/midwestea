import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
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
      locationId,
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
    if (locationId !== undefined) {
      // Resolve locationId to location_id + location (name); clear both if empty
      if (locationId && typeof locationId === 'string' && locationId.trim()) {
        const { data: loc, error: locErr } = await supabase
          .from('locations')
          .select('id, location_name')
          .eq('id', locationId.trim())
          .single();
        if (!locErr && loc) {
          updateData.location_id = loc.id;
          updateData.location = loc.location_name || null;
        }
      } else {
        updateData.location_id = null;
        updateData.location = null;
      }
    } else if (location !== undefined) {
      updateData.location = location;
    }
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
    });
  } catch (error: any) {
    console.error('Error in update class API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

