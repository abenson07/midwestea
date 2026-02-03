import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * Get all classes for a specific course code
 * Used for class selector dropdown on checkout details page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseCode: string }> }
) {
  // Set CORS headers for Webflow access
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    // Next.js 15 requires params to be a Promise
    const resolvedParams = await params;
    const courseCode = resolvedParams.courseCode;

    if (!courseCode) {
      return NextResponse.json(
        { error: 'Course code is required' },
        { status: 400, headers }
      );
    }

    const supabase = createSupabaseAdminClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Fetch all classes for this course code (include enrollment dates for filtering)
    const { data: classes, error } = await supabase
      .from('classes')
      .select('id, class_id, class_name, class_start_date, location, is_online, enrollment_start, enrollment_close')
      .eq('course_code', courseCode)
      .order('class_start_date', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch classes' },
        { status: 500, headers }
      );
    }

    // Only include classes whose enrollment window is open: enrollment_start <= today <= enrollment_close, or is_online
    const openEnrollmentClasses = (classes || []).filter((classItem) => {
      if (classItem.is_online === true) return true;
      if (classItem.enrollment_start && classItem.enrollment_close) {
        return classItem.enrollment_start <= today && classItem.enrollment_close >= today;
      }
      return false;
    });

    // Format dates for display
    const formatDate = (dateString: string | null): string => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Format response
    const formattedClasses = openEnrollmentClasses.map((classItem) => ({
      id: classItem.id,
      classId: classItem.class_id || '',
      className: classItem.class_name || '',
      startDate: formatDate(classItem.class_start_date),
      location: classItem.location || '',
      isOnline: classItem.is_online || false,
      displayText: `${classItem.class_id || 'Class'} - ${formatDate(classItem.class_start_date)}${classItem.location ? ` (${classItem.location})` : ''}`,
    }));

    return NextResponse.json(
      {
        courseCode,
        classes: formattedClasses,
      },
      { headers }
    );
  } catch (error: any) {
    console.error('Error in classes by course code API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

