import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify webhook route is accessible
 * GET /api/webhooks/stripe/test
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Stripe webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
  });
}

