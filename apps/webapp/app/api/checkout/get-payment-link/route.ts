import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * Get a Stripe payment link for a class from the database
 * 
 * POST /api/checkout/get-payment-link
 * Body: { classId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { classId } = await request.json();

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Fetch class data from database
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('class_id', classId)
      .maybeSingle();

    if (classError) {
      console.error('Error fetching class:', classError);
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

    // Get stripe_payment_link from class
    const paymentLinkUrl = (classData as any).stripe_payment_link;

    if (!paymentLinkUrl) {
      return NextResponse.json(
        { error: `Class "${classId}" does not have a stripe_payment_link set` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentLinkUrl,
    });
  } catch (error: any) {
    console.error('Error in get-payment-link API:', error);

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

