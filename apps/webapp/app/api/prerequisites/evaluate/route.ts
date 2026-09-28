import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { evaluateClassPrerequisites } from '@/lib/prerequisite-evaluation';

export const runtime = 'nodejs';

/**
 * Server-side API route to evaluate a class's prerequisites against a
 * student's credentials. Requires authentication; studentId is always
 * derived from the verified bearer token.
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

    const classId = request.nextUrl.searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ success: false, error: 'classId is required' }, { status: 400 });
    }

    const { evaluation, error } = await evaluateClassPrerequisites(supabase, user.id, classId);

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, evaluation });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to evaluate prerequisites' },
      { status: 500 }
    );
  }
}
