import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';
import { getCredentialHistory, reviewCredential } from '@/lib/admin-prerequisites';
import { evaluateClassPrerequisites } from '@/lib/prerequisite-evaluation';

export const runtime = 'nodejs';

/**
 * GET /api/admin/prerequisites/review?studentId=&classId=
 *
 * One student's full class-prerequisite evaluation, plus submission history
 * (including superseded rows) for every prerequisite type in that
 * evaluation. Requires a valid session token AND admins table membership.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const studentId = request.nextUrl.searchParams.get('studentId');
    const classId = request.nextUrl.searchParams.get('classId');

    if (!studentId || !classId) {
      return NextResponse.json(
        { success: false, error: 'studentId and classId are required.' },
        { status: 400 }
      );
    }

    const { evaluation, error: evalError } = await evaluateClassPrerequisites(supabase, studentId, classId);
    if (evalError || !evaluation) {
      return NextResponse.json({ success: false, error: evalError || 'Failed to evaluate prerequisites.' }, { status: 500 });
    }

    const history: Record<string, Awaited<ReturnType<typeof getCredentialHistory>>['credentials']> = {};
    for (const item of evaluation.items) {
      const { credentials, error: historyError } = await getCredentialHistory(
        supabase,
        studentId,
        item.prerequisite_type_id
      );
      if (historyError) {
        return NextResponse.json({ success: false, error: historyError }, { status: 500 });
      }
      history[item.prerequisite_type_id] = credentials;
    }

    return NextResponse.json({ success: true, evaluation, history });
  } catch (error: any) {
    console.error('[API] Error in prerequisites review GET route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/prerequisites/review
 *
 * Approve or reject a credential. Body: { credentialId, decision,
 * rejectionReason? }. Requires a valid session token AND admins table
 * membership; the reviewer identity is always the verified token's user,
 * never a client-supplied value.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { credentialId, decision, rejectionReason } = body;

    if (decision !== 'approved' && decision !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'decision must be "approved" or "rejected".' },
        { status: 400 }
      );
    }

    if (!credentialId || typeof credentialId !== 'string') {
      return NextResponse.json({ success: false, error: 'credentialId is required.' }, { status: 400 });
    }

    const result = await reviewCredential(supabase, {
      credentialId,
      decision,
      rejectionReason,
      reviewerAdminId: user.id,
    });

    if (!result.success || !result.credential) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status ?? 500 });
    }

    const { credential } = result;

    try {
      await insertLog({
        admin_user_id: user.id,
        reference_id: credential.student_id,
        reference_type: 'student',
        action_type: decision === 'approved' ? 'prerequisite_approved' : 'prerequisite_rejected',
        class_id: credential.submitted_for_class_id,
      });
    } catch (logError: any) {
      // A logging failure must not fail the review -- the DB write already committed.
      console.error('[API] Failed to log prerequisite review:', logError);
    }

    return NextResponse.json({ success: true, credential });
  } catch (error: any) {
    console.error('[API] Error in prerequisites review POST route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
