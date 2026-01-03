import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@midwestea/utils';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, classId } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe secret key is not configured' },
        { status: 500 }
      );
    }

    const stripe = getStripeClient(stripeSecretKey);
    const supabase = createSupabaseAdminClient();

    // Fetch class from database to get stripe_price_id
    const { data: classRecord, error: classError } = await supabase
      .from('classes')
      .select('stripe_price_id, id')
      .eq('class_id', classId)
      .single();

    if (classError || !classRecord) {
      return NextResponse.json(
        { error: `Class not found with class_id: ${classId}` },
        { status: 404 }
      );
    }

    if (!classRecord.stripe_price_id) {
      return NextResponse.json(
        { error: `Class ${classId} does not have a stripe_price_id configured` },
        { status: 400 }
      );
    }

    // Create or find Stripe customer by email
    let customerId: string;
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: email,
        name: fullName,
      });
      customerId = customer.id;
    }

    // Determine base path for redirect URLs
    const origin = request.headers.get('origin') || 
                   request.nextUrl.origin ||
                   (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    
    // Determine base path - in dev basePath is empty, in prod it's '/checkout'
    const currentPath = request.nextUrl.pathname;
    const basePath = currentPath.startsWith('/checkout') ? '/checkout' : '';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: classRecord.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        full_name: fullName,
        class_id: classId,
      },
      success_url: `${origin}${basePath}/success`,
      cancel_url: `${origin}${basePath}/details?classID=${classId}`,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

