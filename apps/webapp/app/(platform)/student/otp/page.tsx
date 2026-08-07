"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP, getSession } from "@/lib/auth";
import { resendStudentOTP, ensureNoMismatchedSession } from "@/lib/student-auth";
import { Logo } from "@midwestea/ui";
import { OtpDigitsInput } from "@/components/ui/OtpDigitsInput";

/**
 * Only accept a `next` destination that starts with `/student/` -- anything
 * else (an absolute URL, `/admin`, etc.) falls back to `/student` so this
 * param can never be used as an open redirect.
 */
function resolveNextDestination(next: string | null): string {
  if (next && next.startsWith("/student/")) {
    return next;
  }
  return "/student";
}

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const next = searchParams.get("next");
  const destination = resolveNextDestination(next);

  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // If a session already exists, only treat it as "already logged in" when
  // it belongs to this email. A mismatched session (e.g. a different
  // student never signed out on this browser) gets signed out instead of
  // silently accepted -- previously this bounced to /student as whoever was
  // already logged in, regardless of whose OTP link this was.
  useEffect(() => {
    if (!email) return;
    (async () => {
      const { session } = await getSession();
      if (session && session.user?.email?.toLowerCase() === email.toLowerCase()) {
        router.push(destination);
        return;
      }
      if (session) {
        await ensureNoMismatchedSession(email);
      }
    })();
  }, [router, email, destination]);

  // Redirect if no email (but wait a bit for searchParams to be available)
  useEffect(() => {
    // Give searchParams time to be available
    const timer = setTimeout(() => {
      if (!email) {
        router.push("/student/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [email, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!otpCode || otpCode.length !== 8) {
      setError("Please enter the complete 8-digit code");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    // Defensive: clear any mismatched session before this verify attempt,
    // in case one appeared between mount and submit.
    await ensureNoMismatchedSession(email);

    const result = await verifyOTP(email, otpCode);

    if (result.success) {
      // Wait a moment for session to be established, then verify and redirect
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check session before redirecting
      const { session } = await getSession();
      if (session) {
        router.push(destination);
      } else {
        // Retry once more after a short delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const { session: retrySession } = await getSession();
        if (retrySession) {
          router.push(destination);
        } else {
          setError("Session not established. Please try again.");
          setLoading(false);
          setOtpCode("");
        }
      }
    } else {
      setError(result.error || "Invalid OTP code");
      setLoading(false);
      // Clear OTP on error
      setOtpCode("");
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setResendLoading(true);
    setError("");

    const result = await resendStudentOTP(email);

    if (result.success) {
      // Show success message briefly
      setError("");
      alert("OTP code resent successfully!");
    } else {
      setError(result.error || "Failed to resend OTP");
    }

    setResendLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gray-50 p-4">
      {/* Background image - only visible on desktop */}
      <div className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none">
        <img
          src="https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/6912436c1ee78552087a3a09_ccp.avif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* OTP Card */}
      <div className="w-full md:w-auto md:min-w-[400px] bg-white rounded-lg md:shadow-lg p-8 md:p-10 relative z-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {/* Welcome Text */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Check your email for the code</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp-0" className="block text-sm font-medium text-gray-700 mb-3">
              Verification code
            </label>
            <OtpDigitsInput
              value={otpCode}
              onChange={(value) => {
                setOtpCode(value);
                setError("");
              }}
              disabled={loading}
            />
            {email && (
              <p className="mt-2 text-sm text-gray-500 text-center">
                Code sent to {email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 8}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-gray-600 hover:text-gray-900 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resendLoading ? "Sending..." : "Didn't get the code? Send a new one"}
          </button>
        </div>

        {/* Back to midwestea.com link */}
        <div className="mt-6 text-center">
          <a
            href="https://midwestea.com"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to midwestea.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default function StudentOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center w-full h-screen">
        <p>Loading...</p>
      </div>
    }>
      <OTPForm />
    </Suspense>
  );
}
