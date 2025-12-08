import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Next.js 14 and 15 param formats
    const params = await Promise.resolve(context.params);
    const studentId = params.id;

    // Get the authorization header (Bearer token from Supabase session)
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();
    
    // Verify the session token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    // Get current admin using the verified user ID
    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found. Please ensure you are registered as an admin.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid email field' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    console.log(`[update-email] Attempting to update email for user ${studentId} to ${email}`);

    // First, verify the user exists
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserById(studentId);
    
    if (getUserError) {
      console.error('[update-email] Error fetching user:', getUserError);
      return NextResponse.json(
        { success: false, error: `User not found: ${getUserError.message}` },
        { status: 404 }
      );
    }

    if (!existingUser || !existingUser.user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`[update-email] User found. Current email: ${existingUser.user.email}`);

    // Check if email is the same (no update needed)
    if (existingUser.user.email === email) {
      console.log(`[update-email] Email unchanged, skipping update`);
      return NextResponse.json({
        success: true,
        email: existingUser.user.email,
        message: 'Email unchanged',
      });
    }

    // Update the auth user's email using admin client
    try {
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        studentId,
        { 
          email: email.trim(),
          email_confirm: true 
        }
      );

      if (updateError) {
        console.error('[update-email] Error updating auth email:', {
          error: updateError,
          message: updateError.message,
          status: updateError.status,
          name: updateError.name,
        });
        // Extract more detailed error information
        const errorMessage = updateError.message || JSON.stringify(updateError) || 'Failed to update email';
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 500 }
        );
      }
      
      console.log(`[update-email] Successfully updated email for user ${studentId}`);

      if (!updatedUser || !updatedUser.user) {
        return NextResponse.json(
          { success: false, error: 'Failed to update email: no user returned' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        email: updatedUser.user.email,
      });
    } catch (updateException: any) {
      console.error('[update-email] Exception updating email:', updateException);
      return NextResponse.json(
        { success: false, error: updateException.message || 'Failed to update email' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in update-email API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

