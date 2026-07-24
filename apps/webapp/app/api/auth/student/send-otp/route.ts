import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

export const runtime = 'nodejs';

/**
 * POST /api/auth/student/send-otp
 *
 * Send OTP email to an existing student. Unlike the admin send-otp route,
 * this never creates a new auth user — unknown emails get a generic
 * rejection so this endpoint can't be used to silently create bare accounts.
 *
 * Request body:
 * - email: string (required)
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createSupabaseAdminClient();

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: false },
    });

    if (otpError) {
      console.error('[auth/student/send-otp] Error sending OTP:', otpError);
      return NextResponse.json(
        { success: false, error: 'Failed to send code. Please check your email address.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[auth/student/send-otp] Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
