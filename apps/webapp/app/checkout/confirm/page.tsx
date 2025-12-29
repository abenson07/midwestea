'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Class } from '@midwestea/types';
import CheckoutLayout from '@/components/CheckoutLayout';
import CheckoutPaymentSchedule from '@/components/CheckoutPaymentSchedule';

function CheckoutConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const classIDParam = searchParams.get('classID');
    
    if (!classIDParam) {
      setError('Class ID is required. Please provide a classID in the URL (e.g., ?classID=cct-001).');
      setLoading(false);
      return;
    }

    const fetchClassData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const basePath = typeof window !== 'undefined' 
          ? (window.location.pathname.startsWith('/app') ? '/app' : '')
          : '';
        
        const url = `${basePath}/api/classes/by-class-id/${classIDParam}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to load class information');
        }

        const data = await response.json();
        setClassData(data.class);
      } catch (err: any) {
        setError(err.message || 'Failed to load class information');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [searchParams]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Only clear error if email becomes valid while typing (so error disappears when fixed)
    // Don't set new errors while typing - wait for blur or submit
    if (emailError && validateEmail(value)) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    // Validate on blur (when user leaves the field)
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const calculatePaymentSchedule = () => {
    if (!classData) return null;

    const baseAmount = classData.registration_fee || classData.price || 0;
    const amountNow = Math.floor(baseAmount / 2);
    const amountLater = baseAmount - amountNow;

    return {
      total: baseAmount,
      now: amountNow,
      later: amountLater,
      formattedTotal: `$${(baseAmount / 100).toFixed(2)}`,
      formattedNow: `$${(amountNow / 100).toFixed(2)}`,
      formattedLater: `$${(amountLater / 100).toFixed(2)}`,
    };
  };

  const handleCheckout = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setEmailError('');

    try {
      // TODO: Integrate with QuickBooks checkout
      // Placeholder for QuickBooks integration
      // const checkoutResponse = await fetch('/api/checkout/create-quickbooks-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     classId: classData?.class_id,
      //     email,
      //     amount: calculatePaymentSchedule()?.now,
      //   }),
      // });
      // const { checkoutUrl } = await checkoutResponse.json();
      // window.location.href = checkoutUrl;
    } catch (err: any) {
      setEmailError(err.message || 'Failed to initiate checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentSchedule = calculatePaymentSchedule();

  if (loading) {
    return (
      <CheckoutLayout title="Loading...">
        <div>Loading checkout...</div>
      </CheckoutLayout>
    );
  }

  if (error || !classData) {
    return (
      <CheckoutLayout 
        title="Error" 
        buttonText="Go Back" 
        onButtonClick={() => router.push('/checkout/details?classID=' + searchParams.get('classID'))}
      >
        <div>{error || 'Failed to load class'}</div>
      </CheckoutLayout>
    );
  }

  // Use 'webflow-image' (with hyphen) as that's the actual field name in the database
  const imageUrlValue = (classData as any)['webflow-image'] || undefined;
  const hasRegistrationFee = !!(classData.registration_fee && classData.registration_fee > 0);
  const invoice1DueDate = (classData as any)['invoice_1_due_date'] || undefined;
  const invoice2DueDate = (classData as any)['invoice_2_due_date'] || undefined;

  return (
    <CheckoutLayout 
      imageUrl={imageUrlValue}
      titleContent={
        <>
          <h1 
            style={{ 
              margin: 0,
              display: 'block',
              color: 'var(--Color-Scheme-1-Text, #191920)',
              fontFamily: '"PP Neue Corp"',
              fontSize: 'var(--Text-Sizes-Heading-4, 32px)',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '90%',
              textTransform: 'uppercase'
            }}
          >
            Confirm details
          </h1>
          <p
            style={{
              margin: 0,
              color: 'var(--Semantics-Text, #191920)',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '140%'
            }}
          >
            Enter your email and review the payment schedule below to continue.
          </p>
        </>
      }
      emailField={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: 'var(--Semantics-Text, #191920)',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}
              >
                Email Address *
              </p>
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--color-neutral-light, #969699)',
              borderRadius: 'var(--radius-extra-small, 4px)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              padding: '12px',
              width: '100%'
            }}
          >
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="example@email.com"
              className="checkout-email-input"
              style={{
                flex: 1,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.4,
                color: 'var(--text-input-text-input-text, #191920)',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                minWidth: 0,
                padding: 0
              }}
            />
          </div>
          {emailError && (
            <p
              style={{
                margin: 0,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '14px',
                color: '#ef4444'
              }}
            >
              {emailError}
            </p>
          )}
        </div>
      }
      buttonText={isSubmitting ? 'Processing...' : 'Proceed to QuickBooks Checkout'}
      onButtonClick={handleCheckout}
      onBackClick={() => router.back()}
      wrapperClassName="checkout-payment-schedule-wrapper"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {/* Show both variants for review */}
        <CheckoutPaymentSchedule
          hasRegistrationFee={true}
          registrationFee={classData.registration_fee || undefined}
          price={classData.price || undefined}
          invoice1DueDate={invoice1DueDate}
          invoice2DueDate={invoice2DueDate}
        />
        <CheckoutPaymentSchedule
          hasRegistrationFee={false}
          price={classData.price || undefined}
        />
      </div>
    </CheckoutLayout>
  );
}

export default function CheckoutConfirmPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutConfirmContent />
    </Suspense>
  );
}

