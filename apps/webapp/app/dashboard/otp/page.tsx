"use client";

import { useState, useEffect, FormEvent, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP, resendOTP, getSession } from "@/lib/auth";
import { Logo } from "@midwestea/ui";

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(8).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if already authenticated
  useEffect(() => {
    getSession().then(({ session }) => {
      if (session) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  // Redirect if no email (but wait a bit for searchParams to be available)
  useEffect(() => {
    // Give searchParams time to be available
    const timer = setTimeout(() => {
      if (!email) {
        router.push("/dashboard/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [email, router]);

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1); // Take only the last character if multiple
    
    if (digit) {
      const newDigits = [...otpDigits];
      newDigits[index] = digit;
      setOtpDigits(newDigits);
      setError("");

      // Auto-advance to next input
      if (index < 7) {
        focusInput(index + 1);
      }
    } else {
      // Clear current input
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        // If current input is empty, go back and clear previous
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        focusInput(index - 1);
      } else if (otpDigits[index]) {
        // If current input has value, clear it
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
      }
    } else if (e.key === "Delete") {
      // Clear current input without moving
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < 7) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const digits = pastedData.replace(/\D/g, "").slice(0, 8); // Extract up to 8 digits
    
    if (digits) {
      const newDigits = [...otpDigits];
      // Fill inputs starting from the current index
      for (let i = 0; i < digits.length && (index + i) < 8; i++) {
        newDigits[index + i] = digits[i];
      }
      setOtpDigits(newDigits);
      setError("");

      // Focus the input after the last filled digit
      const nextIndex = Math.min(index + digits.length, 7);
      focusInput(nextIndex);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Join all digits together
    const otp = otpDigits.join("");

    if (!otp || otp.length !== 8) {
      setError("Please enter the complete 8-digit code");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    const result = await verifyOTP(email, otp);

    if (result.success) {
      // Wait a moment for session to be established, then verify and redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check session before redirecting
      const { session } = await getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        // Retry once more after a short delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const { session: retrySession } = await getSession();
        if (retrySession) {
          router.push("/dashboard");
        } else {
          setError("Session not established. Please try again.");
          setLoading(false);
          setOtpDigits(Array(8).fill(""));
          focusInput(0);
        }
      }
    } else {
      setError(result.error || "Invalid OTP code");
      setLoading(false);
      // Clear OTP on error
      setOtpDigits(Array(8).fill(""));
      focusInput(0);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setResendLoading(true);
    setError("");

    const result = await resendOTP(email);

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
            <div className="flex gap-2 justify-center">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(index, e)}
                  disabled={loading}
                  maxLength={1}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className="w-12 h-14 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center text-2xl font-semibold disabled:opacity-50"
                />
              ))}
            </div>
            {email && (
              <p className="mt-2 text-sm text-gray-500 text-center">
                Code sent to {email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otpDigits.some(d => !d)}
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

export default function OTPPage() {
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

