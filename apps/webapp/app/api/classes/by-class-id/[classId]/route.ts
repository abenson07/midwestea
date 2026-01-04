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

    // Calculate invoice due dates based on class_start_date if it exists
    if (classData.class_start_date) {
      try {
        const startDate = new Date(classData.class_start_date);
        
        // Invoice 1: due 3 weeks (21 days) before class_start_date
        const invoice1DueDate = new Date(startDate);
        invoice1DueDate.setDate(invoice1DueDate.getDate() - 21);
        
        // Invoice 2: due 1 week (7 days) after class_start_date
        const invoice2DueDate = new Date(startDate);
        invoice2DueDate.setDate(invoice2DueDate.getDate() + 7);
        
        // Format dates as YYYY-MM-DD strings
        const formatDateString = (date: Date): string => {
          return date.toISOString().split('T')[0];
        };
        
        // Override invoice dates in the response
        (classData as any).invoice_1_due_date = formatDateString(invoice1DueDate);
        (classData as any).invoice_2_due_date = formatDateString(invoice2DueDate);
      } catch (error) {
        console.error('Error calculating invoice dates:', error);
        // Continue without modifying dates if calculation fails
      }
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
