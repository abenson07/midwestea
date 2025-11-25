"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP, resendOTP, getSession } from "@/lib/auth";
import { Logo } from "@midwestea/ui";

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    getSession().then(({ session }) => {
      if (session) {
        router.push("/");
      }
    });
  }, [router]);

  // Redirect if no email (but wait a bit for searchParams to be available)
  useEffect(() => {
    // Give searchParams time to be available
    const timer = setTimeout(() => {
      if (!email) {
        router.push("/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [email, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers, no length limit
    const digits = value.replace(/\D/g, "");
    setOtp(digits);
    setError("");
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const digits = pastedData.replace(/\D/g, "");
    setOtp(digits);
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length === 0) {
      setError("Please enter the OTP code");
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
        router.push("/");
      } else {
        // Retry once more after a short delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const { session: retrySession } = await getSession();
        if (retrySession) {
          router.push("/");
        } else {
          setError("Session not established. Please try again.");
          setLoading(false);
          setOtp("");
        }
      }
    } else {
      setError(result.error || "Invalid OTP code");
      setLoading(false);
      // Clear OTP on error
      setOtp("");
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
    <div className="bg-white flex items-center justify-center relative w-full h-screen">
      <div className="flex flex-col grow h-full items-center px-16 py-0 relative shrink-0 w-full">
        {/* Navbar */}
        <div className="flex flex-col h-[72px] items-start justify-center overflow-clip relative shrink-0 w-full">
          <Logo />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8 grow items-center justify-center min-h-0 min-w-0 relative shrink-0 w-full">
          {/* Section Title */}
          <div className="flex flex-col gap-6 items-center max-w-[480px] relative shrink-0 text-black text-center w-full">
            <p className="font-bold leading-[1.2] relative shrink-0 text-[48px] w-full">
              OTP
            </p>
            <p className="font-normal leading-[1.5] relative shrink-0 text-[18px] w-full">
              Enter the OTP we sent to your email
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6 items-center justify-center max-w-[480px] relative shrink-0 w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
              {/* OTP Input */}
              <div className="flex flex-col gap-2 items-start relative shrink-0 w-full">
                <label
                  htmlFor="otp"
                  className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                >
                  OTP Code*
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  disabled={loading}
                  placeholder="Enter OTP code"
                  className="border border-black border-solid box-border flex gap-2 items-center p-3 shrink-0 w-full h-[72px] text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 rounded-lg"
                />
              </div>

              {/* Error Message */}
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}

              {/* Buttons */}
              <div className="flex flex-col gap-6 items-center relative shrink-0">
                <div className="flex flex-col gap-4 items-start relative shrink-0 w-[480px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-black border border-black border-solid box-border flex gap-2 items-center justify-center px-6 py-3 relative shrink-0 w-full text-white text-[16px] font-normal leading-[1.5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {loading ? "Verifying..." : "Confirm"}
                  </button>
                </div>
                <div className="flex font-normal gap-[5px] items-center leading-[1.5] relative shrink-0 text-black text-[16px] text-center whitespace-pre">
                  <p className="relative shrink-0">Didn&apos;t get the code?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="underline relative shrink-0 cursor-pointer hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? "Sending..." : "Send a new one"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-[5px] h-[72px] items-center relative shrink-0 w-full">
          <p className="font-normal leading-[1.5] relative shrink-0 text-black text-[14px] text-center whitespace-pre">
            © 2022 Relume
          </p>
        </div>
      </div>

      {/* Placeholder Image */}
      <div className="grow h-full min-h-0 min-w-0 relative shrink-0 bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
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

