import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';

/**
 * PATCH /api/courses/[id]/update
 *
 * Persists the admin "program/course settings" form. Mirrors
 * apps/webapp/app/api/classes/[id]/update/route.ts's pattern — the
 * settings page previously only updated local React state (BEN-1155/1156
 * cleanup pass: the Aug 19 admin rebuild never finished wiring this page).
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await context.params;

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
      return NextResponse.json({ success: false, error: 'Unauthorized - Invalid session' }, { status: 401 });
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      courseName,
      programmingOffering,
      courseImage,
      lengthOfClass,
      certificationLength,
      certificateReminderMonths,
      registrationLimit,
      price,
      registrationFee,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (courseName !== undefined) updateData.course_name = courseName;
    if (programmingOffering !== undefined) updateData.programming_offering = programmingOffering;
    if (courseImage !== undefined) updateData.course_image = courseImage;
    if (lengthOfClass !== undefined) updateData.length_of_class = lengthOfClass;
    if (certificationLength !== undefined) updateData.certification_length = certificationLength;
    if (certificateReminderMonths !== undefined) updateData.certificate_reminder_months = certificateReminderMonths;
    if (registrationLimit !== undefined) updateData.registration_limit = registrationLimit;
    if (price !== undefined) updateData.price = price;
    if (registrationFee !== undefined) updateData.registration_fee = registrationFee;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    try {
      await insertLog({
        admin_user_id: admin.id,
        reference_id: courseId,
        reference_type: 'course',
        action_type: 'detail_updated',
      });
    } catch (logError) {
      console.error('[API] Failed to log course update:', logError);
    }

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error: any) {
    console.error('[API] Error updating course:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
