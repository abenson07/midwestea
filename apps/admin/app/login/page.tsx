"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithOTP, getSession } from "@/lib/auth";

// Placeholder logo component
function CompanyLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-[36px] w-[70px] flex items-center justify-center">
        <span className="text-xl font-bold">Logo</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if already authenticated
  useEffect(() => {
    getSession().then(({ session }) => {
      if (session) {
        router.push("/success");
      }
    });
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signInWithOTP(email);

    if (result.success) {
      // Redirect to OTP page with email in query params
      router.push(`/otp?email=${encodeURIComponent(email)}`);
    } else {
      setError(result.error || "Failed to send OTP");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex items-center justify-center relative w-full h-screen">
      <div className="flex flex-col grow h-full items-center px-16 py-0 relative shrink-0 w-full">
        {/* Navbar */}
        <div className="flex flex-col h-[72px] items-start justify-center overflow-clip relative shrink-0 w-full">
          <CompanyLogo className="h-[36px] overflow-clip relative shrink-0 w-[84px]" />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8 grow items-center justify-center min-h-0 min-w-0 relative shrink-0 w-full">
          {/* Section Title */}
          <div className="flex flex-col gap-6 items-center max-w-[480px] relative shrink-0 text-black text-center w-full">
            <p className="font-bold leading-[1.2] relative shrink-0 text-[48px] w-full">
              Log In
            </p>
            <p className="font-normal leading-[1.5] relative shrink-0 text-[18px] w-full">
              Lorem ipsum dolor sit amet adipiscing elit.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6 items-center justify-center max-w-[480px] relative shrink-0 w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
              {/* Email Input */}
              <div className="flex flex-col gap-2 items-start relative shrink-0 w-full">
                <label
                  htmlFor="email"
                  className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                >
                  Email*
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="border border-black border-solid box-border flex gap-2 items-center p-3 shrink-0 w-full focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter your email"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-6 items-center relative shrink-0">
                <div className="flex flex-col gap-4 items-start relative shrink-0 w-[480px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-black border border-black border-solid box-border flex gap-2 items-center justify-center px-6 py-3 relative shrink-0 w-full text-white text-[16px] font-normal leading-[1.5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  >
                    {loading ? "Sending..." : "Log in"}
                  </button>
                </div>
                <div className="flex font-normal gap-[5px] items-center leading-[1.5] relative shrink-0 text-black text-[16px] text-center whitespace-pre">
                  <p className="relative shrink-0">Don&apos;t have an account?</p>
                  <p className="underline relative shrink-0 cursor-pointer hover:text-gray-600">
                    Sign Up
                  </p>
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

