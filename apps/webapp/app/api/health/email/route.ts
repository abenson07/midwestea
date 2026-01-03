import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getResendClient } from '@/lib/email';
import { Resend } from 'resend';

export const runtime = 'nodejs';

/**
 * GET /api/health/email
 * 
 * Health check endpoint for email sending capability
 * Tests email sending by attempting to send a test email
 * 
 * Query parameters:
 * - testEmail: Email address to send test email to (optional, defaults to checking capability only)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testEmail = searchParams.get('testEmail');

    const healthCheck: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      timestamp: string;
      checks: {
        resendClient: { status: 'ok' | 'error'; message: string };
        emailSending?: { status: 'ok' | 'error'; message: string; emailId?: string };
      };
      metrics?: {
        responseTimeMs: number;
      };
    } = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        resendClient: { status: 'error', message: 'Not checked' },
      },
    };

    const startTime = Date.now();

    // Check 1: Resend client initialization
    try {
      const client = getResendClient();
      healthCheck.checks.resendClient = {
        status: 'ok',
        message: 'Resend client initialized successfully',
      };
    } catch (error: any) {
      healthCheck.checks.resendClient = {
        status: 'error',
        message: `Failed to initialize Resend client: ${error.message}`,
      };
      healthCheck.status = 'unhealthy';
      healthCheck.metrics = {
        responseTimeMs: Date.now() - startTime,
      };
      return NextResponse.json(healthCheck, {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check 2: Test email sending (if testEmail provided)
    if (testEmail) {
      try {
        const result = await sendEmail({
          from: process.env.EMAIL_FROM || 'noreply@midwestea.com',
          to: testEmail,
          subject: 'Health Check Test Email',
          html: '<p>This is a test email from the health check endpoint.</p>',
        });

        if (result.success) {
          healthCheck.checks.emailSending = {
            status: 'ok',
            message: 'Test email sent successfully',
            emailId: result.id,
          };
        } else {
          healthCheck.checks.emailSending = {
            status: 'error',
            message: result.error || 'Failed to send test email',
          };
          healthCheck.status = 'degraded';
        }
      } catch (error: any) {
        healthCheck.checks.emailSending = {
          status: 'error',
          message: `Error sending test email: ${error.message}`,
        };
        healthCheck.status = 'degraded';
      }
    }

    healthCheck.metrics = {
      responseTimeMs: Date.now() - startTime,
    };

    const statusCode = healthCheck.status === 'healthy' ? 200 : healthCheck.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthCheck, {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

