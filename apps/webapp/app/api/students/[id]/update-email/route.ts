import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    console.log('[update-email] Route called');
    
    // Handle both Next.js 14 and 15 param formats
    let params: { id: string };
    try {
      params = await Promise.resolve(context.params);
    } catch (paramsError: any) {
      console.error('[update-email] Error resolving params:', paramsError);
      return NextResponse.json(
        { success: false, error: 'Invalid route parameters' },
        { status: 400 }
      );
    }
    
    const studentId = params.id;
    console.log('[update-email] Student ID:', studentId);
    
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing student ID' },
        { status: 400 }
      );
    }

    // Get the authorization header (Bearer token from Supabase session)
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    let supabase;
    try {
      supabase = createSupabaseAdminClient();
      console.log('[update-email] Admin client created successfully');
    } catch (clientError: any) {
      console.error('[update-email] Error creating admin client:', clientError);
      return NextResponse.json(
        { success: false, error: `Failed to initialize admin client: ${clientError.message}` },
        { status: 500 }
      );
    }
    
    // Verify the session token
    console.log('[update-email] Verifying session token...');
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
      console.log(`[update-email] Calling updateUserById with:`, {
        studentId,
        email: email.trim(),
        email_confirm: true
      });
      
      // First, check if the email is already in use by another user
      const { data: usersWithEmail, error: checkError } = await supabase.auth.admin.listUsers();
      if (!checkError && usersWithEmail) {
        const emailInUse = usersWithEmail.users.find(
          u => u.email === email.trim() && u.id !== studentId
        );
        if (emailInUse) {
          return NextResponse.json(
            { success: false, error: 'This email address is already in use by another user' },
            { status: 400 }
          );
        }
      }
      
      // Try updating the email
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        studentId,
        { 
          email: email.trim(),
          email_confirm: true 
        }
      );

      if (updateError) {
        console.error('[update-email] Error updating auth email - Full error object:', JSON.stringify(updateError, null, 2));
        console.error('[update-email] Error details:', {
          message: updateError.message,
          status: updateError.status,
          name: updateError.name,
          code: (updateError as any).code,
          error_description: (updateError as any).error_description,
        });
        
        // Extract more detailed error information
        let errorMessage = updateError.message || 'Failed to update email';
        const errorCode = (updateError as any).code;
        
        // Handle specific error codes
        if (errorCode === 'unexpected_failure') {
          errorMessage = 'Unable to update email. This may be due to a pending email change request or database constraints. Please try again or contact support.';
        } else if (errorCode === 'email_address_not_authorized') {
          errorMessage = 'This email address is not authorized';
        } else if (errorCode === 'email_rate_limit_exceeded') {
          errorMessage = 'Too many email change requests. Please wait before trying again.';
        }
        
        // Check for common error types in message
        if ((updateError as any).error_description) {
          errorMessage = (updateError as any).error_description;
        } else if ((updateError as any).msg) {
          errorMessage = (updateError as any).msg;
        }
        
        // Provide more user-friendly messages for common errors
        if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
          errorMessage = 'This email address is already in use by another user';
        } else if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('does not exist')) {
          errorMessage = 'User not found in authentication system';
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: errorMessage,
            errorCode: errorCode || 'unknown',
            details: 'Check Supabase dashboard logs for more information'
          },
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
      console.error('[update-email] Exception stack:', updateException.stack);
      console.error('[update-email] Exception details:', JSON.stringify(updateException, Object.getOwnPropertyNames(updateException)));
      return NextResponse.json(
        { success: false, error: updateException.message || updateException.toString() || 'Failed to update email' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[update-email] Top-level error in update-email API:', error);
    console.error('[update-email] Error stack:', error.stack);
    console.error('[update-email] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      { success: false, error: error.message || error.toString() || 'Internal server error' },
      { status: 500 }
    );
  }
}

