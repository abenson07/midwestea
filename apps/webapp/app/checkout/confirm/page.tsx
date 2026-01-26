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
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const classIDParam = searchParams.get('classID');
    const emailParam = searchParams.get('email');
    const fullNameParam = searchParams.get('fullName');
    
    // Set email and fullName from URL params if available
    if (emailParam) {
      setEmail(emailParam);
    }
    if (fullNameParam) {
      setFullName(fullNameParam);
    }
    
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

  // Redirect back to details if email is missing
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (!emailParam && !loading && classData) {
      const classIDParam = searchParams.get('classID');
      router.push(`/checkout/details?classID=${classIDParam}`);
    }
  }, [searchParams, loading, classData, router]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      // Ensure user exists in auth.users
      const basePath = typeof window !== 'undefined' 
        ? (window.location.pathname.startsWith('/app') ? '/app' : '')
        : '';
      
      const ensureUserResponse = await fetch(`${basePath}/api/checkout/ensure-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!ensureUserResponse.ok) {
        const errorData = await ensureUserResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to ensure user exists');
      }

      const ensureUserResult = await ensureUserResponse.json();

      // Get Stripe payment link for the class
      if (!classData?.class_id) {
        throw new Error('Class data is missing');
      }

      const checkoutResponse = await fetch(`${basePath}/api/checkout/get-payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: classData.class_id,
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to get payment link');
      }

      const { paymentUrl } = await checkoutResponse.json();
      
      if (!paymentUrl) {
        throw new Error('Payment URL not received from server');
      }

      // Redirect to Stripe payment link
      window.location.href = paymentUrl;
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

  // Use 'class_image' as the field name in the database
  const imageUrlValue = (classData as any)['class_image'] || undefined;
  const hasTuition = !!(classData.price && classData.price > 0);
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
            Review the payment schedule below to continue.
          </p>
        </>
      }
      buttonText={isSubmitting ? 'Processing...' : 'Proceed to Payment'}
      onButtonClick={handleCheckout}
      onBackClick={() => {
        const classIDParam = searchParams.get('classID');
        const emailParam = searchParams.get('email');
        const fullNameParam = searchParams.get('fullName');
        
        const params = new URLSearchParams({ classID: classIDParam || '' });
        if (emailParam) params.append('email', emailParam);
        if (fullNameParam) params.append('fullName', fullNameParam);
        
        router.push(`/checkout/details?${params.toString()}`);
      }}
      wrapperClassName="checkout-payment-schedule-wrapper"
    >
      <CheckoutPaymentSchedule
        hasTuition={hasTuition}
        registrationFee={classData.registration_fee || undefined}
        price={classData.price || undefined}
        invoice1DueDate={hasTuition ? invoice1DueDate : undefined}
        invoice2DueDate={hasTuition ? invoice2DueDate : undefined}
      />
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

