import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient, formatCurrency } from '@midwestea/utils';

/**
 * Get a single class by ID with all formatting and calculations
 * Returns data ready to display in Webflow checkout pages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const classId = params.id;

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400, headers }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Fetch the class
    const { data: classData, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error || !classData) {
      console.error('Error fetching class:', error);
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404, headers }
      );
    }

    // Determine base amount: registration_fee if exists, otherwise price (tuition)
    const baseAmountCents = classData.registration_fee || classData.price || 0;
    
    // Calculate payment amounts (split in half)
    const amountNowCents = Math.floor(baseAmountCents / 2);
    const amountLaterCents = baseAmountCents - amountNowCents; // Handle odd cents

    // Format dates
    const formatDate = (dateString: string | null): string => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Calculate due dates (for now, using class_start_date as reference)
    // You may want to add specific due date fields to your database
    const dueDateNow = classData.class_start_date 
      ? formatDate(classData.class_start_date)
      : '';
    
    // For "later" payment, you might want to calculate based on class start date + some days
    // For now, using class_close_date or a calculated date
    const dueDateLater = classData.class_close_date
      ? formatDate(classData.class_close_date)
      : classData.class_start_date
      ? (() => {
          const startDate = new Date(classData.class_start_date + 'T00:00:00');
          const laterDate = new Date(startDate);
          laterDate.setDate(laterDate.getDate() + 30); // 30 days after start
          return laterDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        })()
      : '';

    // Format the response with all calculations and formatting done
    const response = {
      // Class details
      classId: classData.class_id || '',
      className: classData.class_name || '',
      courseCode: classData.course_code || '',
      location: classData.location || '',
      isOnline: classData.is_online || false,
      isOnlineDisplay: classData.is_online ? 'Yes' : 'No',
      
      // Dates (formatted)
      enrollmentStart: formatDate(classData.enrollment_start),
      enrollmentClose: formatDate(classData.enrollment_close),
      classStartDate: formatDate(classData.class_start_date),
      classCloseDate: formatDate(classData.class_close_date),
      
      // Payment information (formatted)
      amountNow: formatCurrency(amountNowCents),
      amountLater: formatCurrency(amountLaterCents),
      totalAmount: formatCurrency(baseAmountCents),
      dueDateNow,
      dueDateLater,
      
      // Raw values (in cents) if needed
      amountNowCents,
      amountLaterCents,
      totalAmountCents: baseAmountCents,
      
      // Additional class info
      lengthOfClass: classData.length_of_class || '',
      certificationLength: classData.certification_length || null,
      graduationRate: classData.graduation_rate || null,
      registrationLimit: classData.registration_limit || null,
    };

    return NextResponse.json(response, { headers });
  } catch (error: any) {
    console.error('Error in class API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

