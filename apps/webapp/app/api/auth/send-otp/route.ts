import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

export const runtime = 'nodejs';

/**
 * POST /api/auth/send-otp
 * 
 * Send OTP email to admin users only
 * Checks if email exists in admins table before sending OTP
 * 
 * Request body:
 * - email: string (required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use admin client to check if email exists in admins table
    const supabase = createSupabaseAdminClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists in admins table (not deleted)
    // Use ilike for case-insensitive match - stored email may have different casing
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email')
      .ilike('email', normalizedEmail)
      .is('deleted_at', null)
      .maybeSingle();

    // If admin not found, return generic error without revealing admin check
    if (adminError || !admin) {
      if (adminError) {
        console.error('[auth/send-otp] Admin lookup error:', adminError.message, 'code:', adminError.code);
      }
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP. Please check your email address.' },
        { status: 403 }
      );
    }

    // Admin found - send OTP using Supabase Auth
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (otpError) {
      console.error('[auth/send-otp] Error sending OTP:', otpError);
      return NextResponse.json(
        { success: false, error: otpError.message || 'Failed to send OTP' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[auth/send-otp] Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
