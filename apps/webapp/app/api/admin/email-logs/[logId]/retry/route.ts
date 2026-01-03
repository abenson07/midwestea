import { NextRequest, NextResponse } from 'next/server';
import { retryFailedEmail } from '@/lib/email';
import { getCurrentAdmin } from '@/lib/logging';

export const runtime = 'nodejs';

/**
 * POST /api/admin/email-logs/[logId]/retry
 * 
 * Retry sending a failed email by log ID
 * Requires admin authentication
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ logId: string }> }
) {
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

    const params = await context.params;
    const logId = params.logId;

    if (!logId) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }

    const result = await retryFailedEmail(logId);

    if (result.success) {
      return NextResponse.json(result, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return NextResponse.json(result, {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    console.error('[admin/email-logs/retry] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retry email',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

