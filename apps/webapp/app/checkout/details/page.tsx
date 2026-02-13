'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Class } from '@midwestea/types';
import CheckoutLayout from '@/components/CheckoutLayout';
import CheckoutClassDescription from '@/components/CheckoutClassDescription';
import CheckoutClassCard from '@/components/CheckoutClassCard';
import CheckoutPaymentSchedule from '@/components/CheckoutPaymentSchedule';

function CheckoutDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [classData, setClassData] = useState<Class | null>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  // Cache all class data by classId to avoid refetching
  const [classesCache, setClassesCache] = useState<Record<string, Class>>({});
  const classesCacheRef = useRef<Record<string, Class>>({});
  const isInternalUpdate = useRef(false);
  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Helper to update both state and ref
  const updateCache = (updates: Record<string, Class>) => {
    classesCacheRef.current = { ...classesCacheRef.current, ...updates };
    setClassesCache(classesCacheRef.current);
  };

  useEffect(() => {
    // Skip if this is an internal update (we're just updating URL from card click)
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const classIDParam = searchParams.get('classID');
    const emailParam = searchParams.get('email');
    const fullNameParam = searchParams.get('fullName');
    
    // Set email and fullName from URL params if available (e.g., when navigating back)
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

    // Check cache first using ref (avoids dependency issues)
    if (classesCacheRef.current[classIDParam]) {
      const cachedClass = classesCacheRef.current[classIDParam];
      setClassData(cachedClass);
      setSelectedClassId(classIDParam);
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
        
        // Fetch the specific class
        console.log('[checkout/details] Fetching class by ID:', classIDParam);
        const classResponse = await fetch(`${basePath}/api/classes/by-class-id/${classIDParam}`);
        
        if (!classResponse.ok) {
          const errorData = await classResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.log('[checkout/details] Class fetch failed:', { status: classResponse.status, classIDParam, errorData });
          // 410 = enrollment closed: redirect to an open class in same course, or to waitlist
          if (classResponse.status === 410 && errorData.courseCode) {
            console.log('[checkout/details] 410 with courseCode, checking for open classes:', errorData.courseCode);
            const classesResponse = await fetch(`${basePath}/api/classes/by-course-code/${errorData.courseCode}`);
            console.log('[checkout/details] by-course-code response:', { ok: classesResponse.ok, status: classesResponse.status });
            if (classesResponse.ok) {
              const classesResult = await classesResponse.json();
              const openClasses = classesResult.classes || [];
              console.log('[checkout/details] Open classes for course:', { courseCode: errorData.courseCode, count: openClasses.length, classIds: openClasses.map((c: { classId: string }) => c.classId) });
              if (openClasses.length > 0) {
                const firstClass = openClasses[0];
                const params = new URLSearchParams();
                params.set('classID', firstClass.classId);
                if (emailParam) params.set('email', emailParam);
                if (fullNameParam) params.set('fullName', fullNameParam);
                console.log('[checkout/details] Redirecting to open class:', firstClass.classId);
                router.replace(`/checkout/details?${params.toString()}`);
                return;
              }
            }
            console.log('[checkout/details] No open classes, redirecting to waitlist:', errorData.courseCode);
            router.replace(`/checkout/waitlist?courseCode=${encodeURIComponent(errorData.courseCode)}`);
            return;
          }
          throw new Error(errorData.error || 'Failed to load class information');
        }

        const classResult = await classResponse.json();
        const fetchedClass = classResult.class;
        console.log('[checkout/details] Class loaded successfully:', { classId: fetchedClass.class_id, courseCode: fetchedClass.course_code });
        
        // Cache this class
        updateCache({ [fetchedClass.class_id]: fetchedClass });
        setClassData(fetchedClass);
        setSelectedClassId(fetchedClass.class_id);

        // If class has a course_code, check for other available classes
        if (fetchedClass.course_code) {
          const classesResponse = await fetch(`${basePath}/api/classes/by-course-code/${fetchedClass.course_code}`);
          
          if (classesResponse.ok) {
            const classesResult = await classesResponse.json();
            setAvailableClasses(classesResult.classes || []);
            
            // Fetch and cache full details for all classes
            const cachePromises = classesResult.classes.map(async (cls: any) => {
              // Skip if already cached or if it's the current class
              if (classesCacheRef.current[cls.classId] || cls.classId === fetchedClass.class_id) {
                return;
              }
              
              try {
                const fullClassResponse = await fetch(`${basePath}/api/classes/by-class-id/${cls.classId}`);
                if (fullClassResponse.ok) {
                  const fullClassResult = await fullClassResponse.json();
                  return { classId: cls.classId, classData: fullClassResult.class };
                }
              } catch (err) {
                console.error(`Failed to fetch full details for class ${cls.classId}:`, err);
              }
              return null;
            });
            
            const cachedClasses = await Promise.all(cachePromises);
            const newCacheEntries: Record<string, Class> = {};
            cachedClasses.forEach((item) => {
              if (item) {
                newCacheEntries[item.classId] = item.classData;
              }
            });
            
            // Update cache with all fetched classes
            if (Object.keys(newCacheEntries).length > 0) {
              updateCache(newCacheEntries);
            }
          }
        } else {
          setAvailableClasses([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load class information');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleContinue = async () => {
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

    if (!selectedClassId || !classData) {
      return;
    }

    setIsSubmitting(true);
    setEmailError('');
    setFullNameError('');

    try {
      if (!classData?.class_id) {
        throw new Error('Class data is missing');
      }

      const basePath = typeof window !== 'undefined' 
        ? (window.location.pathname.startsWith('/app') ? '/app' : '')
        : '';
      
      // Create Stripe checkout session
      const checkoutResponse = await fetch(`${basePath}/api/checkout/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          classId: classData.class_id,
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json().catch(() => ({ error: 'Unknown error' }));
        // #region agent log
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { checkoutUrl } = await checkoutResponse.json();
      
      if (!checkoutUrl) {
        throw new Error('Checkout URL not received from server');
      }

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setEmailError(err.message || 'Failed to initiate checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClassSelection = (classId: string) => {
    // Check cache first - if we have it, use it immediately (no loading state)
    if (classesCacheRef.current[classId]) {
      setClassData(classesCacheRef.current[classId]);
      setSelectedClassId(classId);
      
      // Update URL without triggering useEffect
      isInternalUpdate.current = true;
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('classID', classId);
      window.history.replaceState({}, '', newUrl.toString());
      
      return;
    }
    
    // If not in cache, fetch it (shouldn't happen if we cached all classes properly)
    // But keep this as fallback
    const fetchAndUpdate = async () => {
      try {
        const basePath = typeof window !== 'undefined' 
          ? (window.location.pathname.startsWith('/app') ? '/app' : '')
          : '';
        
        const response = await fetch(`${basePath}/api/classes/by-class-id/${classId}`);
        if (response.ok) {
          const result = await response.json();
          const fetchedClass = result.class;
          
          // Cache it
          updateCache({ [classId]: fetchedClass });
          setClassData(fetchedClass);
          setSelectedClassId(classId);
          
          // Update URL without triggering useEffect
          isInternalUpdate.current = true;
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('classID', classId);
          window.history.replaceState({}, '', newUrl.toString());
        }
      } catch (err) {
        console.error('Failed to fetch selected class details:', err);
      }
    };
    
    fetchAndUpdate();
  };

  // Format date for card display (convert date string to "January 15th, 2025" format)
  const formatDateForCard = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    // Try to parse the date string (could be ISO format or formatted string)
    let date: Date;
    try {
      // Try ISO format first (e.g., "2025-01-15")
      if (dateString.includes('T') || dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        date = new Date(dateString);
      } else {
        // Try parsing formatted date (e.g., "January 15, 2025")
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
    } catch {
      return dateString; // Return original if parsing fails
    }
    
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    // Add ordinal suffix
    const getOrdinalSuffix = (n: number): string => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

  // Check if we have multiple classes (more than 1)
  const hasMultipleClasses = availableClasses.length > 1;

  if (loading) {
    return (
      <CheckoutLayout title="Loading...">
        <div>Loading class details...</div>
      </CheckoutLayout>
    );
  }

  if (error || !classData) {
    return (
      <CheckoutLayout title="Error" buttonText="Go Back" onButtonClick={() => router.push('/')}>
        <div>{error || 'Failed to load class'}</div>
      </CheckoutLayout>
    );
  }

  // Use 'class_image' as the field name in the database
  const imageUrlValue = (classData as any)['class_image'] || undefined;

  return (
    <CheckoutLayout 
      title={classData.class_name || classData.class_id || 'Class Details'}
      price={classData.price || undefined}
      registrationFee={classData.registration_fee || undefined}
      imageUrl={imageUrlValue}
      buttonText={isSubmitting ? 'Processing...' : 'Continue to Payment'}
      onButtonClick={handleContinue}
      onBackClick={() => router.back()}
      fullNameField={
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
      }
      classesContent={
        hasMultipleClasses ? (
          <>
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'uppercase',
                margin: 0,
                height: '20px',
                color: 'var(--semantics-text, #191920)'
              }}
            >
              Choose class
            </p>
            {availableClasses.map((cls) => {
              const isActive = cls.classId === selectedClassId;
              // Use cached full class data if available, otherwise fall back to current classData or basic data
              const fullClassData = classesCache[cls.classId] || (cls.classId === classData?.class_id ? classData : null);
              
              // Get date - prefer raw date from cached full class data
              let cardDate: string = '';
              if (fullClassData?.class_start_date) {
                cardDate = formatDateForCard(fullClassData.class_start_date);
              } else if (cls.startDate) {
                // Parse the formatted date from API (e.g., "January 15, 2025") and add ordinal
                try {
                  const parsedDate = new Date(cls.startDate);
                  if (!isNaN(parsedDate.getTime())) {
                    cardDate = formatDateForCard(parsedDate.toISOString().split('T')[0]);
                  } else {
                    cardDate = cls.startDate; // Fallback to original
                  }
                } catch {
                  cardDate = cls.startDate; // Fallback to original
                }
              }
              
              // Get end date - prefer raw date from cached full class data
              let cardEndDate: string | undefined = undefined;
              if (fullClassData?.class_close_date) {
                cardEndDate = formatDateForCard(fullClassData.class_close_date);
              }
              
              // Get raw dates for grid display (when card is active)
              const cardStartDate = fullClassData?.class_start_date || undefined;
              const cardCloseDate = fullClassData?.class_close_date || undefined;
              
              return (
                <CheckoutClassCard
                  key={cls.classId}
                  variant={cls.isOnline ? 'online' : 'in-person'}
                  state={isActive ? 'active' : 'default'}
                  location={fullClassData?.location || cls.location || undefined}
                  date={cardDate}
                  endDate={cardEndDate}
                  startDate={cardStartDate}
                  closeDate={cardCloseDate}
                  onClick={() => handleClassSelection(cls.classId)}
                />
              );
            })}
          </>
        ) : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        {/* Show description only when there's a single class */}
        {!hasMultipleClasses && (
          <>
            {classData.is_online ? (
              <CheckoutClassDescription
                variant="online"
                description="Train alongside experienced EMS professionals in real-world environments. Hands-on, state-approved instruction that builds confidence and keeps your skills field-ready."
              />
            ) : (
              <CheckoutClassDescription
                variant="in-person"
                description="Train alongside experienced EMS professionals in real-world environments. Hands-on, state-approved instruction that builds confidence and keeps your skills field-ready."
                startDate={classData.class_start_date || undefined}
                endDate={classData.class_close_date || undefined}
                location={classData.location || undefined}
                frequency={classData.length_of_class || undefined}
              />
            )}
          </>
        )}

        {/* Payment Schedule */}
        <CheckoutPaymentSchedule
          hasTuition={!!(classData.price && classData.price > 0)}
          registrationFee={classData.registration_fee || undefined}
          price={classData.price || undefined}
          invoice1DueDate={(classData as any)['invoice_1_due_date'] || undefined}
          invoice2DueDate={(classData as any)['invoice_2_due_date'] || undefined}
        />
      </div>
    </CheckoutLayout>
  );
}

export default function CheckoutDetailsPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutDetailsContent />
    </Suspense>
  );
}

