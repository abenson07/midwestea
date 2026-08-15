'use client';

import { useEffect, useState, Suspense, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Class, EvaluatedPrerequisite, PrerequisiteEvaluation } from '@midwestea/types';
import CheckoutLayout from '@/components/CheckoutLayout';
import { PrerequisiteStepForm } from '@/components/ui/PrerequisiteStepForm';
import { OtpDigitsInput } from '@/components/ui/OtpDigitsInput';
import { fetchPrerequisiteEvaluation } from '@/lib/prerequisites';
import { sendStudentOTP, resendStudentOTP, ensureNoMismatchedSession } from '@/lib/student-auth';
import { verifyOTP, getSession, signOut } from '@/lib/auth';

const PENDING_PREREQ_CLASS_ID_KEY = 'midwestea.pendingPrereqClassId';

const headingStyle: CSSProperties = {
  margin: 0,
  display: 'block',
  color: 'var(--Color-Scheme-1-Text, #191920)',
  fontFamily: '"PP Neue Corp"',
  fontSize: 'var(--Text-Sizes-Heading-4, 32px)',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '90%',
  textTransform: 'uppercase',
};

const bodyStyle: CSSProperties = {
  margin: 0,
  color: 'var(--Semantics-Text, #191920)',
  fontFamily: '"DM Sans", sans-serif',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '140%',
};

type Step =
  | { name: 'loading' }
  | { name: 'error'; message: string }
  | { name: 'no_session_id' } // payment can't be verified from this URL alone
  | { name: 'no_prereqs_confirmation' }
  | { name: 'login_prompt' }
  | { name: 'otp_entry' }
  | { name: 'prerequisite_step' }
  | { name: 'done' };

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>({ name: 'loading' });
  const [email, setEmail] = useState<string | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [evaluation, setEvaluation] = useState<PrerequisiteEvaluation | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      // Private browsing / sessionStorage disabled / a bookmarked bare URL:
      // we cannot prove payment or resolve an email from this URL alone.
      setStep({ name: 'no_session_id' });
      return;
    }

    const load = async () => {
      try {
        const sessionInfoResponse = await fetch(
          `/api/checkout/session-info?session_id=${encodeURIComponent(sessionId)}`
        );
        const sessionInfo = await sessionInfoResponse.json();
        if (!sessionInfoResponse.ok) {
          throw new Error(sessionInfo.error || 'Failed to confirm payment');
        }

        setEmail(sessionInfo.email);

        try {
          sessionStorage.removeItem(PENDING_PREREQ_CLASS_ID_KEY);
        } catch {
          // sessionStorage unavailable -- nothing to clear.
        }

        const classResponse = await fetch(`/api/classes/by-class-id/${sessionInfo.classId}`);
        const classResult = await classResponse.json();
        if (!classResponse.ok) {
          throw new Error(classResult.error || 'Failed to load class information');
        }

        setClassData(classResult.class as Class);

        if (classResult.hasRequiredPrerequisites) {
          setStep({ name: 'login_prompt' });
        } else {
          setStep({ name: 'no_prereqs_confirmation' });
        }
      } catch (err) {
        const error = err as Error;
        setStep({ name: 'error', message: error.message || 'Something went wrong confirming your enrollment.' });
      }
    };

    load();
  }, [searchParams]);

  const handleStartLogin = async () => {
    if (!email) return;
    setOtpError('');
    setOtpSending(true);

    await ensureNoMismatchedSession(email);
    const result = await sendStudentOTP(email);

    setOtpSending(false);

    if (result.success) {
      setStep({ name: 'otp_entry' });
    } else {
      setOtpError(result.error || 'Failed to send code. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setResendLoading(true);
    setOtpError('');
    const result = await resendStudentOTP(email);
    setResendLoading(false);
    if (!result.success) {
      setOtpError(result.error || 'Failed to resend code.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || otpCode.length !== 8) {
      setOtpError('Please enter the complete 8-digit code');
      return;
    }

    setOtpError('');
    setOtpVerifying(true);

    // Defensive: clear any mismatched session that appeared between the
    // login click and this submit before trusting verifyOTP's result.
    await ensureNoMismatchedSession(email);

    const result = await verifyOTP(email, otpCode);

    if (!result.success) {
      setOtpVerifying(false);
      setOtpError(result.error || 'Invalid code');
      setOtpCode('');
      return;
    }

    // Load-bearing identity check: the session verifyOTP just established
    // must actually belong to the email that paid, not a stale session that
    // won a race. verifyOtp is itself scoped to `email`, so this should
    // always match -- but we prove it rather than assume it.
    const { session } = await getSession();
    if (!session || session.user?.email?.toLowerCase() !== email.toLowerCase()) {
      await signOut();
      setOtpVerifying(false);
      setOtpError("This code doesn't match the account for this registration. Please try again.");
      setOtpCode('');
      return;
    }

    if (!classData) {
      setOtpVerifying(false);
      setOtpError('Something went wrong loading your class. Please refresh and try again.');
      return;
    }

    const { evaluation: evaluationResult, error: evaluationError } = await fetchPrerequisiteEvaluation(
      classData.id
    );

    setOtpVerifying(false);

    if (evaluationError || !evaluationResult) {
      setOtpError(evaluationError || 'Failed to load your class requirements.');
      return;
    }

    setEvaluation(evaluationResult);
    setStepIndex(0);
    setStep(evaluationResult.outstanding.length === 0 ? { name: 'done' } : { name: 'prerequisite_step' });
  };

  const handleAdvance = () => {
    const outstanding = evaluation?.outstanding || [];
    const nextIndex = stepIndex + 1;
    if (nextIndex >= outstanding.length) {
      setStep({ name: 'done' });
    } else {
      setStepIndex(nextIndex);
    }
  };

  if (step.name === 'loading') {
    return (
      <CheckoutLayout title="Loading...">
        <div>Loading...</div>
      </CheckoutLayout>
    );
  }

  if (step.name === 'error') {
    return (
      <CheckoutLayout title="Something went wrong">
        <p style={bodyStyle}>{step.message}</p>
      </CheckoutLayout>
    );
  }

  if (step.name === 'no_session_id') {
    return (
      <CheckoutLayout
        titleContent={
          <>
            <h1 style={headingStyle}>Payment received</h1>
            <p style={bodyStyle}>
              Check your email for details, or log in to your student portal to continue.
            </p>
          </>
        }
        buttonText="Go to student login"
        onButtonClick={() => router.push('/student/login')}
      />
    );
  }

  if (step.name === 'no_prereqs_confirmation') {
    return (
      <CheckoutLayout
        imageUrl={classData?.class_image || undefined}
        titleContent={
          <>
            <h1 style={headingStyle}>You&apos;re enrolled!</h1>
            <p style={bodyStyle}>
              There&apos;s nothing else needed for this class. We&apos;ll be in touch soon.
            </p>
          </>
        }
        buttonText="Go to your student portal"
        onButtonClick={() => router.push('/student')}
      />
    );
  }

  if (step.name === 'login_prompt') {
    return (
      <CheckoutLayout
        imageUrl={classData?.class_image || undefined}
        titleContent={
          <>
            <h1 style={headingStyle}>You&apos;re registered</h1>
            <p style={bodyStyle}>
              Let&apos;s get your prerequisites entered in. To start, click here to log in.
            </p>
          </>
        }
      >
        {otpError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {otpError}
          </div>
        )}
        <button
          type="button"
          onClick={handleStartLogin}
          disabled={otpSending}
          className="w-full bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {otpSending ? 'Sending code...' : 'Click here to log in'}
        </button>
      </CheckoutLayout>
    );
  }

  if (step.name === 'otp_entry') {
    return (
      <CheckoutLayout
        imageUrl={classData?.class_image || undefined}
        titleContent={
          <>
            <h1 style={headingStyle}>Enter your code</h1>
            <p style={bodyStyle}>{email ? `We sent a code to ${email}.` : 'We sent you a code.'}</p>
          </>
        }
      >
        <div className="space-y-4">
          {otpError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {otpError}
            </div>
          )}
          <OtpDigitsInput
            value={otpCode}
            onChange={(value) => {
              setOtpCode(value);
              setOtpError('');
            }}
            disabled={otpVerifying}
            idPrefix="success-otp"
          />
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={otpVerifying || otpCode.length !== 8}
            className="w-full bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {otpVerifying ? 'Verifying...' : 'Continue'}
          </button>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : "Didn't get the code? Send a new one"}
          </button>
        </div>
      </CheckoutLayout>
    );
  }

  if (step.name === 'prerequisite_step') {
    const outstanding: EvaluatedPrerequisite[] = evaluation?.outstanding || [];
    const item = outstanding[stepIndex];

    if (!item || !classData) {
      return (
        <CheckoutLayout title="Something went wrong">
          <p style={bodyStyle}>Failed to load your class requirements. Please refresh and try again.</p>
        </CheckoutLayout>
      );
    }

    return (
      <CheckoutLayout
        imageUrl={classData.class_image || undefined}
        titleContent={
          <>
            <h1 style={headingStyle}>Class requirements</h1>
            <p style={bodyStyle}>{`Step ${stepIndex + 1} of ${outstanding.length}`}</p>
          </>
        }
      >
        <PrerequisiteStepForm
          key={item.class_prerequisite_id}
          item={item}
          classId={classData.id}
          onSubmitted={handleAdvance}
          onSkip={handleAdvance}
          skipLabel="Do this later"
        />
      </CheckoutLayout>
    );
  }

  // step.name === 'done'
  return (
    <CheckoutLayout
      imageUrl={classData?.class_image || undefined}
      titleContent={
        <>
          <h1 style={headingStyle}>You&apos;re enrolled</h1>
          <p style={bodyStyle}>We&apos;ll be in touch soon. Make sure you finish your prerequisites in time.</p>
        </>
      }
      buttonText="Go to your student portal"
      onButtonClick={() => router.push('/student')}
    />
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <CheckoutLayout title="Loading...">
          <div>Loading...</div>
        </CheckoutLayout>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
