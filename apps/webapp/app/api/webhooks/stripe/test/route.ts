import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/logging';

/**
 * Test endpoint to verify webhook route is accessible
 * GET /api/webhooks/stripe/test
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { createSupabaseAdminClient } = await import('@midwestea/utils');
    const supabase = createSupabaseAdminClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stripe webhook endpoint is accessible',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[webhook-test] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

