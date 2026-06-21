"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { AuthError } from "@supabase/supabase-js";

export interface AuthResponse {
  success: boolean;
  error?: string;
}

const OTP_504_ERROR_MESSAGE =
  "Issue logging in, please contact us. Mention Error 504";

function otpSendErrorMessage(error: {
  message?: string;
  status?: number;
}): string {
  if (
    error.status === 504 ||
    error.message?.includes("504") ||
    error.message?.toLowerCase().includes("upstream request timeout")
  ) {
    return OTP_504_ERROR_MESSAGE;
  }

  return error.message || "Failed to send OTP";
}

/**
 * Send OTP to email address (admin users only)
 * Calls API route that checks admin status before sending OTP
 */
export async function signInWithOTP(email: string): Promise<AuthResponse> {
  try {
    // Determine base path - in production it's /app, in dev it might be empty
    const basePath = typeof window !== 'undefined' 
      ? (window.location.pathname.startsWith('/app') ? '/app' : '')
      : '';
    
    const response = await fetch(`${basePath}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { success: false, error: otpSendErrorMessage(data) };
    }

    return { success: true };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: otpSendErrorMessage(error) };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  email: string,
  token: string
): Promise<AuthResponse> {
  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: error.message || "Failed to verify OTP" };
  }
}

/**
 * Resend OTP code
 */
export async function resendOTP(email: string): Promise<AuthResponse> {
  // For OTP resend, we just call signInWithOTP again
  return signInWithOTP(email);
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: error.message || "Failed to sign out" };
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return { session: null, error: error.message };
    }

    return { session, error: null };
  } catch (err) {
    const error = err as AuthError;
    return { session: null, error: error.message || "Failed to get session" };
  }
}

