'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Class } from '@midwestea/types';

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const classIdParam = searchParams.get('classId');
    
    if (!classIdParam) {
      setError('Class ID is required. Please provide a classId in the URL (e.g., ?classId=cct-001).');
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
        
        const url = `${basePath}/api/classes/by-class-id/${classIdParam}`;
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

  // Minimal rendering - ready for new layout implementation
  // classData, loading, and error states are available for use
  if (loading) return null;
  if (error) return null;
  if (!classData) return null;

  return null;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPageContent />
    </Suspense>
  );
}

