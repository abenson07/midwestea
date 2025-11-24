"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithOTP, getSession } from "@/lib/auth";


// Placeholder logo component
function CompanyLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-[36px] flex items-center justify-center">
        <span className="text-2xl font-bold italic tracking-tight" style={{ fontFamily: 'serif' }}>
          Logo
        </span>
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
        router.push("/add_class_test");
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
    <div className="flex w-full h-screen">
      {/* Left Column - Login Form (60%) */}
      <div className="flex flex-col w-[60%] bg-white h-full relative">
        {/* Logo - Top Left */}
        <div className="flex items-center h-[72px] px-16 pt-0 pb-0">
          <CompanyLogo className="h-[36px]" />
        </div>

        {/* Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-16">
          <div className="w-full max-w-[480px]">
            {/* Section Title */}
            <div className="flex flex-col gap-6 items-center text-center mb-8">
              <h1 className="text-[48px] font-bold leading-[1.2] text-black">
                Log In
              </h1>
              <p className="text-[18px] font-normal leading-[1.5] text-black">
                Lorem ipsum dolor sit amet adipiscing elit.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-[16px] font-normal leading-[1.5] text-black"
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
                  className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                  placeholder="Enter your email"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white border border-black rounded-lg px-6 py-3 text-[16px] font-normal leading-[1.5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                {loading ? "Sending..." : "Log in"}
              </button>

              {/* Sign Up Link */}
              <div className="flex items-center justify-center gap-1 text-[16px] font-normal leading-[1.5] text-black text-center">
                <span>Don&apos;t have an account?</span>
                <button
                  type="button"
                  className="underline hover:text-gray-600 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer - Bottom Left */}
        <div className="flex items-center h-[72px] px-16">
          <p className="text-[14px] font-normal leading-[1.5] text-black">
            © 2022 Relume
          </p>
        </div>
      </div>

      {/* Right Column - Image (40%) */}
      <div className="w-[40%] h-full relative overflow-hidden">
        <img
          src="https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/6912436c1ee78552087a3a09_ccp.avif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

