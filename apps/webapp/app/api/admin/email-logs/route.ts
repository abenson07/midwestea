import { NextRequest, NextResponse } from 'next/server';
import { getEmailLogs, getEmailDeliveryMetrics, checkEmailAlerts } from '@/lib/email';
import { getCurrentAdmin } from '@/lib/logging';

export const runtime = 'nodejs';

/**
 * GET /api/admin/email-logs
 * 
 * Get email logs with filtering options
 * Requires admin authentication
 * 
 * Query parameters:
 * - limit: Number of logs to return (default: 50, max: 500)
 * - offset: Offset for pagination (default: 0)
 * - emailType: Filter by email type (course_enrollment, program_enrollment, etc.)
 * - success: Filter by success status (true/false)
 * - enrollmentId: Filter by enrollment ID
 * - studentId: Filter by student ID
 * - startDate: Start date (ISO string)
 * - endDate: End date (ISO string)
 * - includeMetrics: Include delivery metrics (true/false)
 * - checkAlerts: Check for alerts (true/false)
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 500);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const emailType = searchParams.get('emailType') || undefined;
    const successParam = searchParams.get('success');
    const success = successParam ? successParam === 'true' : undefined;
    const enrollmentId = searchParams.get('enrollmentId') || undefined;
    const studentId = searchParams.get('studentId') || undefined;
    const startDateParam = searchParams.get('startDate');
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDateParam = searchParams.get('endDate');
    const endDate = endDateParam ? new Date(endDateParam) : undefined;
    const includeMetrics = searchParams.get('includeMetrics') === 'true';
    const checkAlertsParam = searchParams.get('checkAlerts') === 'true';

    // Get email logs
    const { logs, total } = await getEmailLogs({
      limit,
      offset,
      emailType,
      success,
      enrollmentId,
      studentId,
      startDate,
      endDate,
    });

    const response: any = {
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };

    // Include metrics if requested
    if (includeMetrics) {
      const metrics = await getEmailDeliveryMetrics(startDate, endDate);
      response.metrics = metrics;
    }

    // Check alerts if requested
    if (checkAlertsParam) {
      const alerts = await checkEmailAlerts();
      response.alerts = alerts;
    }

    return NextResponse.json(response, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[admin/email-logs] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch email logs',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

