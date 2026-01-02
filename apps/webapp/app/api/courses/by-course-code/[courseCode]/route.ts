import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseCode: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseCode = resolvedParams.courseCode;

    if (!courseCode) {
      return NextResponse.json(
        { error: 'Course code is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseAdminClient();

    // Fetch course by course_code
    const { data: course, error } = await supabase
      .from('courses')
      .select('id, course_name, course_code, type, price, registration_fee, course_image')
      .eq('course_code', courseCode.toUpperCase())
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch course' },
        { status: 500 }
      );
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (err: any) {
    console.error('Unexpected error fetching course:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

