'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Class } from '@midwestea/types';
import CheckoutLayout from '@/components/CheckoutLayout';
import CheckoutClassDescription from '@/components/CheckoutClassDescription';

function CheckoutDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [classData, setClassData] = useState<Class | null>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

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
        
        // Fetch the specific class
        const classResponse = await fetch(`${basePath}/api/classes/by-class-id/${classIDParam}`);
        
        if (!classResponse.ok) {
          const errorData = await classResponse.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to load class information');
        }

        const classResult = await classResponse.json();
        const fetchedClass = classResult.class;
        setClassData(fetchedClass);
        setSelectedClassId(fetchedClass.class_id);

        // If class has a course_code, check for other available classes
        if (fetchedClass.course_code) {
          const classesResponse = await fetch(`${basePath}/api/classes/by-course-code/${fetchedClass.course_code}`);
          
          if (classesResponse.ok) {
            const classesResult = await classesResponse.json();
            setAvailableClasses(classesResult.classes || []);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load class information');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [searchParams]);

  const handleContinue = () => {
    if (selectedClassId) {
      router.push(`/checkout/confirm?classID=${selectedClassId}`);
    }
  };

  const handleClassSelection = async (classId: string) => {
    setSelectedClassId(classId);
    
    // Fetch full class details for the selected class
    try {
      const basePath = typeof window !== 'undefined' 
        ? (window.location.pathname.startsWith('/app') ? '/app' : '')
        : '';
      
      const response = await fetch(`${basePath}/api/classes/by-class-id/${classId}`);
      if (response.ok) {
        const result = await response.json();
        setClassData(result.class);
      }
    } catch (err) {
      console.error('Failed to fetch selected class details:', err);
    }
  };

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

  return (
    <CheckoutLayout 
      title={classData.class_name || classData.class_id || 'Class Details'}
      price={classData.price || undefined}
      registrationFee={classData.registration_fee || undefined}
      buttonText="Continue to Payment"
      onButtonClick={handleContinue}
      onBackClick={() => router.back()}
    >
      {/* Online Variant */}
      <CheckoutClassDescription
        variant="online"
        description="Train alongside experienced EMS professionals in real-world environments. Hands-on, state-approved instruction that builds confidence and keeps your skills field-ready."
      />
      
      {/* In-Person Variant */}
      <CheckoutClassDescription
        variant="in-person"
        description="Train alongside experienced EMS professionals in real-world environments. Hands-on, state-approved instruction that builds confidence and keeps your skills field-ready."
        startDate={classData.class_start_date || undefined}
        endDate={classData.class_close_date || undefined}
        location={classData.location || undefined}
        frequency={classData.length_of_class || undefined}
      />
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

