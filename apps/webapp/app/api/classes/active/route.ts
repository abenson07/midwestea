import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCourseCodeFromSlug } from '@/lib/courseSlugMap';

/**
 * Get active classes for a course
 * Active = enrollment_start <= today <= enrollment_close OR is_online = true
 */
export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams;
    const courseCode = searchParams.get('courseCode');
    const slug = searchParams.get('slug');

    if (!courseCode && !slug) {
      return NextResponse.json(
        { error: 'Either courseCode or slug parameter is required' },
        { status: 400, headers }
      );
    }

    // Resolve course code from slug if needed
    let resolvedCourseCode = courseCode;
    if (!resolvedCourseCode && slug) {
      resolvedCourseCode = getCourseCodeFromSlug(slug);
      if (!resolvedCourseCode) {
        return NextResponse.json(
          { error: `No course code found for slug: ${slug}` },
          { status: 404, headers }
        );
      }
    }

    const supabase = createSupabaseAdminClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Query for active classes:
    // 1. Enrollment dates: enrollment_start <= today <= enrollment_close
    // 2. OR is_online = true
    // We'll fetch all classes for the course and filter in code for better control
    const { data: allClasses, error } = await supabase
      .from('classes')
      .select('*')
      .eq('course_code', resolvedCourseCode)
      .order('class_start_date', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch classes' },
        { status: 500, headers }
      );
    }

    // Filter for active classes
    const data = (allClasses || []).filter((classItem) => {
      // Active if online
      if (classItem.is_online === true) {
        return true;
      }
      
      // Active if enrollment dates are valid and today is within range
      if (classItem.enrollment_start && classItem.enrollment_close) {
        return classItem.enrollment_start <= today && classItem.enrollment_close >= today;
      }
      
      return false;
    });

    // Format the response for easy consumption
    const formattedClasses = (data || []).map((classItem) => ({
      id: classItem.id,
      classId: classItem.class_id,
      className: classItem.class_name,
      courseCode: classItem.course_code,
      enrollmentStart: classItem.enrollment_start,
      enrollmentClose: classItem.enrollment_close,
      classStartDate: classItem.class_start_date,
      classCloseDate: classItem.class_close_date,
      location: classItem.location,
      isOnline: classItem.is_online,
      productId: classItem.product_id,
      lengthOfClass: classItem.length_of_class,
      certificationLength: classItem.certification_length,
      graduationRate: classItem.graduation_rate,
      registrationLimit: classItem.registration_limit,
      price: classItem.price, // in cents
      registrationFee: classItem.registration_fee, // in cents
    }));

    return NextResponse.json(
      {
        courseCode: resolvedCourseCode,
        classes: formattedClasses,
      },
      { headers }
    );
  } catch (error: any) {
    console.error('Error in active classes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

