import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import {
  AdminMessageError,
  resolveClassRecipients,
  resolveStudentRecipient,
  sendAdminMessage,
  validateMessageInput,
} from '@/lib/admin-messages';

export const runtime = 'nodejs';

/**
 * POST /api/admin/messages
 * Body: { subject, message, studentId } | { subject, message, classId }
 *       plus optional { dryRun: true } and { expectedRecipients: number }.
 *
 * Admin-only plain-text email to one student or every active student in a
 * class. dryRun returns the recipient count and names without sending.
 * expectedRecipients (sent by the UI from its dry run) makes the real send
 * refuse if the roster changed in between. Class sends are capped.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Invalid session' }, { status: 401 });
    }
    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json({ success: false, error: 'Admin not found. Please ensure you are registered as an admin.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const { subject, message } = validateMessageInput(body.subject, body.message);
    const hasStudent = body.studentId !== undefined && body.studentId !== null;
    const hasClass = body.classId !== undefined && body.classId !== null;
    if (hasStudent === hasClass) {
      return NextResponse.json({ success: false, error: 'Provide exactly one of studentId or classId' }, { status: 400 });
    }

    const recipients = hasStudent
      ? [await resolveStudentRecipient(supabase, body.studentId)]
      : await resolveClassRecipients(supabase, body.classId);

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'No students with an email address to message' }, { status: 400 });
    }

    if (body.dryRun === true) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        sent: 0,
        failed: [],
        recipients: recipients.length,
        recipientNames: recipients.map((r) => r.name),
      });
    }

    if (typeof body.expectedRecipients === 'number' && body.expectedRecipients !== recipients.length) {
      return NextResponse.json(
        {
          success: false,
          error: `The recipient list changed (expected ${body.expectedRecipients}, now ${recipients.length}). Nothing was sent. Please review and try again.`,
        },
        { status: 409 }
      );
    }

    const result = await sendAdminMessage(recipients, subject, message);
    return NextResponse.json({ success: result.sent > 0 || result.failed.length === 0, ...result });
  } catch (error: any) {
    if (error instanceof AdminMessageError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('[admin/messages] Unexpected error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to send message' }, { status: 500 });
  }
}
