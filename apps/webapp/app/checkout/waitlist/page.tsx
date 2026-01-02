'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CheckoutLayout from '@/components/CheckoutLayout';

function CheckoutWaitlistContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courseName, setCourseName] = useState<string>('');
  const [courseImage, setCourseImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const courseCodeParam = searchParams.get('courseCode');
    
    if (!courseCodeParam) {
      setError('Course code is required. Please provide a courseCode in the URL (e.g., ?courseCode=para).');
      setLoading(false);
      return;
    }

    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const basePath = typeof window !== 'undefined' 
          ? (window.location.pathname.startsWith('/app') ? '/app' : '')
          : '';
        
        // Fetch course directly from courses table by course_code
        const response = await fetch(`${basePath}/api/courses/by-course-code/${courseCodeParam}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to load course information');
        }

        const result = await response.json();
        const course = result.course;
        
        if (course && course.course_name) {
          setCourseName(course.course_name);
        } else {
          // Fallback to course code uppercase
          setCourseName(courseCodeParam.toUpperCase());
        }
        
        // Set course image if available
        if (course && course.course_image) {
          setCourseImage(course.course_image);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course information');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [searchParams]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Only clear error if email becomes valid while typing
    if (emailError && validateEmail(value)) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    // Validate on blur
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    // Only clear error if fullName becomes valid while typing
    if (fullNameError && value.trim()) {
      setFullNameError('');
    }
  };

  const handleFullNameBlur = () => {
    // Validate on blur
    if (!fullName.trim()) {
      setFullNameError('Full name is required');
    } else {
      setFullNameError('');
    }
  };

  const handleSubmit = async () => {
    // Validate email before continuing
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Validate full name before continuing
    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      return;
    }

    setIsSubmitting(true);
    setEmailError('');
    setFullNameError('');

    try {
      const courseCode = searchParams.get('courseCode');
      
      if (!courseCode) {
        setError('Course code is missing');
        setIsSubmitting(false);
        return;
      }
      
      const basePath = typeof window !== 'undefined' 
        ? (window.location.pathname.startsWith('/app') ? '/app' : '')
        : '';
      
      const response = await fetch(`${basePath}/api/waitlist/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseCode,
          email,
          fullName: fullName.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to submit waitlist signup');
      }

      const result = await response.json();
      
      if (result.success) {
        // Set confirmed state to show confirmation message
        setIsConfirmed(true);
      } else {
        throw new Error(result.error || 'Failed to submit waitlist signup');
      }
      
    } catch (err: any) {
      setEmailError(err.message || 'Failed to submit waitlist signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CheckoutLayout title="Loading...">
        <div>Loading waitlist...</div>
      </CheckoutLayout>
    );
  }

  if (error) {
    return (
      <CheckoutLayout title="Error" buttonText="Go Back" onButtonClick={() => router.push('/')}>
        <div>{error}</div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout 
      title={courseName || 'Join Waitlist'}
      imageUrl={courseImage}
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
            {courseName || 'Join Waitlist'}
          </h1>
          <p
            style={{
              margin: 0,
              color: 'var(--Semantics-Text, #191920)',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '140%',
              marginTop: '0.5rem'
            }}
          >
            Sign up and we'll notify you when the next class's registration opens.
          </p>
        </>
      }
      buttonText={isConfirmed ? '' : (isSubmitting ? 'Processing...' : 'Join Waitlist')}
      onButtonClick={isConfirmed ? undefined : handleSubmit}
      onBackClick={() => router.back()}
      price={undefined}
      registrationFee={undefined}
      fullNameField={
        isConfirmed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <p
              style={{
                margin: 0,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.4,
                color: 'var(--Semantics-Text, #191920)'
              }}
            >
              Thank you! You've been added to the waitlist. We'll notify you when registration opens for the next class.
            </p>
          </div>
        ) : (
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
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </p>
              </div>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                border: fullNameError ? '1px solid #ef4444' : '1px solid var(--color-neutral-light, #969699)',
                borderRadius: 'var(--radius-extra-small, 4px)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '12px',
                width: '100%'
              }}
            >
              <input
                type="text"
                value={fullName}
                onChange={handleFullNameChange}
                onBlur={handleFullNameBlur}
                placeholder="John Doe"
                className="checkout-fullname-input"
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
            {fullNameError && (
              <p
                style={{
                  margin: 0,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '14px',
                  color: '#ef4444'
                }}
              >
                {fullNameError}
              </p>
            )}
          </div>
        )
      }
      emailField={
        isConfirmed ? null : (
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
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </p>
              </div>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                border: emailError ? '1px solid #ef4444' : '1px solid var(--color-neutral-light, #969699)',
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
        )
      }
    >
      {/* Empty children - no additional content needed */}
    </CheckoutLayout>
  );
}

export default function CheckoutWaitlistPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutWaitlistContent />
    </Suspense>
  );
}

