'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Class } from '@midwestea/types';
import CheckoutLayout from '@/components/CheckoutLayout';
import CheckoutClassDescription from '@/components/CheckoutClassDescription';
import CheckoutClassCard from '@/components/CheckoutClassCard';

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
        const classResponse = await fetch(`${basePath}/api/classes/by-class-id/${classIDParam}`);
        
        if (!classResponse.ok) {
          const errorData = await classResponse.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to load class information');
        }

        const classResult = await classResponse.json();
        const fetchedClass = classResult.class;
        
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

  const handleContinue = () => {
    if (selectedClassId) {
      router.push(`/checkout/confirm?classID=${selectedClassId}`);
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
      buttonText="Continue to Payment"
      onButtonClick={handleContinue}
      onBackClick={() => router.back()}
      classesContent={
        hasMultipleClasses ? (
          <>
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
              
              return (
                <CheckoutClassCard
                  key={cls.classId}
                  variant={cls.isOnline ? 'online' : 'in-person'}
                  state={isActive ? 'active' : 'default'}
                  location={fullClassData?.location || cls.location || undefined}
                  date={cardDate}
                  onClick={() => handleClassSelection(cls.classId)}
                />
              );
            })}
          </>
        ) : null
      }
    >
      {/* Show description based on is_online boolean */}
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

