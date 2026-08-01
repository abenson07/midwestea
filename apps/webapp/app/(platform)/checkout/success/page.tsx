'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

const PENDING_PREREQ_CLASS_ID_KEY = 'midwestea.pendingPrereqClassId';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [classCode, setClassCode] = useState<string | null>(null);

  useEffect(() => {
    // Get payment_intent from URL if present (Stripe redirect)
    const intentId = searchParams.get('payment_intent');
    if (intentId) {
      setPaymentIntentId(intentId);
    }
  }, [searchParams]);

  useEffect(() => {
    // Resolve which class this payment was for: the ?classID query param
    // first, then the sessionStorage handoff written by /checkout/confirm
    // before the Stripe redirect. Neither may be present (e.g. private
    // browsing with sessionStorage disabled) -- that's a valid state, not
    // an error.
    const queryClassId = searchParams.get('classID');
    if (queryClassId) {
      setClassCode(queryClassId);
      try {
        sessionStorage.removeItem(PENDING_PREREQ_CLASS_ID_KEY);
      } catch {
        // sessionStorage unavailable -- nothing to clear.
      }
      return;
    }

    try {
      const stored = sessionStorage.getItem(PENDING_PREREQ_CLASS_ID_KEY);
      if (stored) {
        setClassCode(stored);
        sessionStorage.removeItem(PENDING_PREREQ_CLASS_ID_KEY);
      }
    } catch {
      // sessionStorage unavailable (e.g. private browsing) -- fall through
      // to the "Go to your student portal" link.
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
        </div>

        {paymentIntentId && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Payment ID: <span className="font-mono text-xs">{paymentIntentId}</span>
            </p>
          </div>
        )}

        <div className="space-y-4">
          {classCode ? (
            <>
              <button
                onClick={() => router.push(`/student/prerequisites/${classCode}`)}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue to class requirements
              </button>
              <p className="text-sm text-gray-500">You&apos;ll be asked to sign in to continue.</p>
            </>
          ) : (
            <a
              href="/student"
              className="block w-full text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Go to your student portal
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

