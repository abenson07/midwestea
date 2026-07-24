import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

export const runtime = 'nodejs';

/**
 * POST /api/students/me/update-email — student self-service email change.
 * Verifies the caller's own token before touching auth.users; never accepts
 * an id from the URL or body, always operates on the verified caller's id.
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email } = body;
    if (typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid email field' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    if (user.email === trimmedEmail) {
      return NextResponse.json({ success: true, email: user.email, message: 'Email unchanged' });
    }

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email: trimmedEmail,
      email_confirm: true,
    });

    if (updateError || !updatedUser?.user) {
      // Deliberately generic: don't reveal whether the failure was a
      // duplicate email or something else, to avoid letting an authenticated
      // student use this as an account-enumeration oracle.
      console.error('[update-email] Failed to update email:', updateError?.message);
      return NextResponse.json(
        { success: false, error: 'Unable to update email. Please try again or contact us.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, email: updatedUser.user.email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
