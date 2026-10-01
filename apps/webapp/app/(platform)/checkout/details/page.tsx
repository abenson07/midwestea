'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Class } from '@midwestea/types';
import CheckoutLayout from '@/components/CheckoutLayout';
import CheckoutClassDescription from '@/components/CheckoutClassDescription';
import CheckoutClassCard from '@/components/CheckoutClassCard';
import CheckoutPaymentSchedule from '@/components/CheckoutPaymentSchedule';
import CheckoutTextField from '@/components/CheckoutTextField';
import { getStoredUtmParams } from '@/lib/utmAttribution';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
  'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA',
  'WV', 'WI', 'WY',
];

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
  // Step 1: choose class. Step 2: student info, then on to payment.
  const [step, setStep] = useState<'class' | 'info'>('class');
  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
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
        
        // Fetch the specific class
        const classResponse = await fetch(`/api/classes/by-class-id/${classIDParam}`);
        
        if (!classResponse.ok) {
          const errorData = await classResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.log('[checkout/details] Class fetch failed:', { status: classResponse.status, classIDParam, errorData });
          // 410 = enrollment closed: redirect to an open class in same course, or to waitlist
          if (classResponse.status === 410 && errorData.courseCode) {
            console.log('[checkout/details] 410 with courseCode, checking for open classes:', errorData.courseCode);
            const classesResponse = await fetch(`/api/classes/by-course-code/${errorData.courseCode}`);
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
          const classesResponse = await fetch(`/api/classes/by-course-code/${fetchedClass.course_code}`);
          
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
                const fullClassResponse = await fetch(`/api/classes/by-class-id/${cls.classId}`);
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

  const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const todayIso = new Date().toISOString().split('T')[0];

  const validateInfo = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!validateEmail(email.trim())) next.email = 'Please enter a valid email address';
    if (!dateOfBirth) next.dateOfBirth = 'Date of birth is required';
    else if (dateOfBirth > todayIso || dateOfBirth < '1900-01-01') {
      next.dateOfBirth = 'Please enter a valid date of birth';
    }
    if (!addressLine1.trim()) next.addressLine1 = 'Address is required';
    if (!city.trim()) next.city = 'City is required';
    if (!stateCode) next.state = 'State is required';
    if (!postalCode.trim()) next.postalCode = 'Zip code is required';
    else if (!/^\d{5}(-\d{4})?$/.test(postalCode.trim())) next.postalCode = 'Enter a valid zip code';
    return next;
  };

  // Clears a field's error as soon as the user edits it
  const setField = (key: string, setter: (v: string) => void) => (value: string) => {
    setter(value);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleContinue = async () => {
    if (step === 'class') {
      if (selectedClassId && classData) setStep('info');
      return;
    }

    const found = validateInfo();
    setErrors(found);
    setSubmitError('');
    if (Object.keys(found).length > 0 || !selectedClassId || !classData) return;

    setIsSubmitting(true);
    try {
      if (!classData?.class_id) {
        throw new Error('Class data is missing');
      }

      // Create Stripe checkout session
      const checkoutResponse = await fetch(`/api/checkout/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          classId: classData.class_id,
          dateOfBirth,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          city: city.trim(),
          state: stateCode,
          postalCode: postalCode.trim(),
          ...getStoredUtmParams(),
        }),
      });

      const data = await checkoutResponse.json().catch(() => ({ error: 'Unknown error' }));

      if (!checkoutResponse.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { checkoutUrl } = data;
      
      if (!checkoutUrl) {
        throw new Error('Checkout URL not received from server');
      }

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to initiate checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'info') {
      setStep('class');
      return;
    }
    router.back();
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
        const response = await fetch(`/api/classes/by-class-id/${classId}`);
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
      buttonText={
        isSubmitting ? 'Processing...' : step === 'class' ? 'Continue' : 'Continue to Payment'
      }
      onButtonClick={handleContinue}
      onBackClick={handleBack}
      classesContent={
        step === 'class' && hasMultipleClasses ? (
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
      {step === 'info' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <CheckoutTextField
            label="Full Name"
            required
            value={fullName}
            onChange={setField('fullName', setFullName)}
            error={errors.fullName}
            placeholder="John Doe"
            autoComplete="name"
          />
          <CheckoutTextField
            label="Email Address"
            required
            type="email"
            value={email}
            onChange={setField('email', setEmail)}
            error={errors.email}
            placeholder="example@email.com"
            autoComplete="email"
          />
          <CheckoutTextField
            label="Date of Birth"
            required
            type="date"
            value={dateOfBirth}
            onChange={setField('dateOfBirth', setDateOfBirth)}
            error={errors.dateOfBirth}
            max={todayIso}
            autoComplete="bday"
          />
          <CheckoutTextField
            label="Address 1"
            required
            value={addressLine1}
            onChange={setField('addressLine1', setAddressLine1)}
            error={errors.addressLine1}
            autoComplete="address-line1"
          />
          <CheckoutTextField
            label="Address 2"
            value={addressLine2}
            onChange={setAddressLine2}
            autoComplete="address-line2"
          />
          <CheckoutTextField
            label="City"
            required
            value={city}
            onChange={setField('city', setCity)}
            error={errors.city}
            autoComplete="address-level2"
          />
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <CheckoutTextField
                label="State"
                required
                value={stateCode}
                onChange={setField('state', setStateCode)}
                error={errors.state}
                options={US_STATES.map((st) => ({ value: st, label: st }))}
                autoComplete="address-level1"
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <CheckoutTextField
                label="Zip"
                required
                value={postalCode}
                onChange={setField('postalCode', setPostalCode)}
                error={errors.postalCode}
                maxLength={10}
                autoComplete="postal-code"
              />
            </div>
          </div>
          {submitError && (
            <p style={{ margin: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: '#ef4444' }}>
              {submitError}
            </p>
          )}
        </div>
      ) : (
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
      )}
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

