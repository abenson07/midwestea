import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const courseId = params.id;

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
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jbLearningLabel, jbLearningUrl, platinumEdLabel, platinumEdUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (jbLearningLabel !== undefined) updateData.jb_learning_label = jbLearningLabel;
    if (jbLearningUrl !== undefined) updateData.jb_learning_url = jbLearningUrl;
    if (platinumEdLabel !== undefined) updateData.platinum_ed_label = platinumEdLabel;
    if (platinumEdUrl !== undefined) updateData.platinum_ed_url = platinumEdUrl;

    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    await insertLog({
      admin_user_id: admin.id,
      reference_id: courseId,
      reference_type: 'course',
      action_type: 'detail_updated',
    });

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
