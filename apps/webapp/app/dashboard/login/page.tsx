"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithOTP, getSession } from "@/lib/auth";
import { Logo } from "@midwestea/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if already authenticated
  useEffect(() => {
    getSession().then(({ session }) => {
      if (session) {
        router.push("/dashboard");
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
      router.push(`/dashboard/otp?email=${encodeURIComponent(email)}`);
    } else {
      setError(result.error || "Failed to send OTP");
      setLoading(false);
    }
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

      {/* Login Card */}
      <div className="w-full md:w-auto md:min-w-[400px] bg-white rounded-lg md:shadow-lg p-8 md:p-10 relative z-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {/* Welcome Text */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome</h1>
          <p className="text-gray-600">Log in to the admin portal</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Continue"}
          </button>
        </form>

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

