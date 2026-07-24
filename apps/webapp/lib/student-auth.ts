"use client";

export interface AuthResponse {
  success: boolean;
  error?: string;
}

/**
 * Send OTP to email address (existing students only)
 * Calls the student-specific API route, which never creates a new auth user.
 */
export async function sendStudentOTP(email: string): Promise<AuthResponse> {
  try {
    const basePath = typeof window !== 'undefined'
      ? (window.location.pathname.startsWith('/app') ? '/app' : '')
      : '';
    const response = await fetch(`${basePath}/api/auth/student/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send code' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to send code' };
  }
}

/**
 * Resend OTP code (student flow)
 */
export async function resendStudentOTP(email: string): Promise<AuthResponse> {
  return sendStudentOTP(email);
}
