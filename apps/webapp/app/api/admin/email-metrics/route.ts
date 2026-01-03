import { NextRequest, NextResponse } from 'next/server';
import { getEmailDeliveryMetrics, checkEmailAlerts } from '@/lib/email';
import { getCurrentAdmin } from '@/lib/logging';

export const runtime = 'nodejs';

/**
 * GET /api/admin/email-metrics
 * 
 * Get email delivery metrics and alerts
 * Requires admin authentication
 * 
 * Query parameters:
 * - startDate: Start date for metrics (ISO string, default: last 24 hours)
 * - endDate: End date for metrics (ISO string, default: now)
 * - failureRateThreshold: Failure rate threshold for alerts (default: 10)
 * - timeWindowHours: Time window in hours for alerts (default: 1)
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

    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const startDateParam = searchParams.get('startDate');
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDateParam = searchParams.get('endDate');
    const endDate = endDateParam ? new Date(endDateParam) : undefined;
    const failureRateThreshold = parseFloat(searchParams.get('failureRateThreshold') || '10');
    const timeWindowHours = parseFloat(searchParams.get('timeWindowHours') || '1');

    // Get metrics
    const metrics = await getEmailDeliveryMetrics(startDate, endDate);

    // Check alerts
    const alerts = await checkEmailAlerts(failureRateThreshold, timeWindowHours);

    return NextResponse.json({
      metrics,
      alerts,
      timestamp: new Date().toISOString(),
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[admin/email-metrics] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch email metrics',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

