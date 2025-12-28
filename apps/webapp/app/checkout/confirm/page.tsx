'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Class } from '@midwestea/types';
import CheckoutLayout from '@/components/CheckoutLayout';

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
    if (value && !validateEmail(value)) {
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

  return (
    <CheckoutLayout 
      title="Confirm Payment"
      price={classData.price || undefined}
      registrationFee={classData.registration_fee || undefined}
      buttonText={isSubmitting ? 'Processing...' : 'Proceed to QuickBooks Checkout'}
      onButtonClick={handleCheckout}
      onBackClick={() => router.push('/checkout/details?classID=' + searchParams.get('classID'))}
    >
      {/* Content will go here */}
      <div>
        {/* Available data: classData, email, emailError, isSubmitting, paymentSchedule */}
        {/* Available functions: handleEmailChange(e), handleCheckout(), validateEmail(email) */}
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

