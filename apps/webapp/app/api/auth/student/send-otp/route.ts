import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { logServerError } from '@/lib/error-reporting/log-server-error';

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

      const message = otpError.message || '';
      const code = otpError.code || '';

      // Supabase's per-address cooldown between codes. Tell the student how long to wait.
      const rateLimited =
        otpError.status === 429 ||
        code === 'over_email_send_rate_limit' ||
        code === 'over_request_rate_limit';
      if (rateLimited) {
        const parsed = Number(/(\d+)\s*seconds?/i.exec(message)?.[1]);
        const waitSeconds = Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${waitSeconds} seconds before requesting another code.`,
          },
          { status: 429 }
        );
      }

      // The only genuine failure: the code email couldn't be sent. Log it (code/status only --
      // no email; error_logs is readable by any authenticated user) so it can be investigated.
      const deliveryFailure =
        (otpError.status !== undefined && otpError.status >= 500) ||
        code === 'unexpected_failure' ||
        /smtp|error sending|sending .*email|email provider/i.test(message);
      if (deliveryFailure) {
        void logServerError({
          message: `send-otp delivery failure: ${code || message}`,
          requestUrl: request.nextUrl.pathname,
          statusCode: otpError.status ?? 500,
          context: { route: 'auth/student/send-otp', code, status: otpError.status },
        });
        return NextResponse.json(
          {
            success: false,
            error: "We couldn't send your code right now. Please try again in a few minutes, or contact support at sbrooks@midwestea.com.",
          },
          { status: 502 }
        );
      }

      // Everything else -- including an email with no student account (shouldCreateUser:false)
      // -- gets the same response as a successful send, so this endpoint can't be used to
      // find out which emails are registered. Anything unexpected is logged for us.
      void logServerError({
        message: `send-otp non-delivery response: ${code || message}`,
        requestUrl: request.nextUrl.pathname,
        statusCode: otpError.status ?? 400,
        context: { route: 'auth/student/send-otp', code, status: otpError.status, treatedAs: 'generic-success' },
      });
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
