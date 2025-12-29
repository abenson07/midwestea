import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * Get a single class by class_id (text field like "cct-001")
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    // Next.js 15 requires params to be a Promise
    const resolvedParams = await params;
    const classId = resolvedParams.classId;

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Fetch the class by class_id (text field) - case-insensitive search
    // First try exact match, then try case-insensitive
    let { data: classData, error } = await supabase
      .from('classes')
      .select('*')
      .eq('class_id', classId)
      .maybeSingle();

    // If not found with exact match, try case-insensitive
    if (!classData && !error) {
      const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
        .from('classes')
        .select('*')
        .ilike('class_id', classId)
        .maybeSingle();
      
      classData = caseInsensitiveData;
      error = caseInsensitiveError;
    }

    if (error) {
      console.error('Error fetching class:', error);
      return NextResponse.json(
        { error: 'Database error while fetching class' },
        { status: 500 }
      );
    }

    if (!classData) {
      return NextResponse.json(
        { error: `Class with ID "${classId}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ class: classData });
  } catch (error: any) {
    console.error('Error in class API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
