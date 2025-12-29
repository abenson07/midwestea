import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * Ensure a user exists in auth.users for the given email
 * Returns information about whether the user existed and if a student record exists
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // 1. Check if user exists in auth.users
    let existingAuthUser = null;
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error listing auth users:', authError);
        return NextResponse.json(
          { error: 'Failed to check users' },
          { status: 500 }
        );
      }

      existingAuthUser = authUsers.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    } catch (error: any) {
      console.error('Error checking auth users:', error);
      return NextResponse.json(
        { error: 'Failed to check users' },
        { status: 500 }
      );
    }

    let userExisted = false;
    let studentExists = false;
    let userId: string | null = null;

    if (existingAuthUser) {
      // User exists
      userExisted = true;
      userId = existingAuthUser.id;
      console.log(`[Ensure User] Email ${email} exists in auth.users`);

      // 2. Check if corresponding student record exists
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('id', existingAuthUser.id)
        .maybeSingle();

      if (studentError) {
        console.error('Error checking student record:', studentError);
        // Continue anyway, we'll just report that we couldn't check
      } else if (student) {
        studentExists = true;
        console.log(`[Ensure User] Student record exists for email ${email}`);
      } else {
        console.log(`[Ensure User] No student record found for email ${email}, creating one...`);
        
        // Create student record
        const { data: newStudent, error: createStudentError } = await supabase
          .from('students')
          .insert({
            id: existingAuthUser.id,
            first_name: null,
            last_name: null,
            phone: null,
            stripe_customer_id: null,
            has_required_info: false,
            t_shirt_size: null,
            vaccination_card_url: null,
            emergency_contact_name: null,
            emergency_contact_phone: null,
          })
          .select()
          .single();

        if (createStudentError) {
          console.error('Error creating student record:', createStudentError);
          return NextResponse.json(
            { error: `Failed to create student record: ${createStudentError.message}` },
            { status: 500 }
          );
        }

        console.log(`[Ensure User] Student record created for email ${email}`);
      }
    } else {
      // User doesn't exist, create it
      console.log(`[Ensure User] Email ${email} does not exist, creating new user...`);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm email for checkout flow
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: `Failed to create user: ${createError.message}` },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
      console.log(`[Ensure User] New user created for email ${email} with ID: ${userId}`);

      // Create student record for the new user
      console.log(`[Ensure User] Creating student record for new user...`);
      const { data: newStudent, error: createStudentError } = await supabase
        .from('students')
        .insert({
          id: userId,
          first_name: null,
          last_name: null,
          phone: null,
          stripe_customer_id: null,
          has_required_info: false,
          t_shirt_size: null,
          vaccination_card_url: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
        })
        .select()
        .single();

      if (createStudentError) {
        console.error('Error creating student record:', createStudentError);
        return NextResponse.json(
          { error: `Failed to create student record: ${createStudentError.message}` },
          { status: 500 }
        );
      }

      console.log(`[Ensure User] Student record created for new user with email ${email}`);
    }

    return NextResponse.json({
      success: true,
      userExisted,
      studentExists,
      userId,
      message: userExisted 
        ? (studentExists ? 'User and student already exist' : 'User existed, student record created')
        : 'User and student created successfully'
    });
  } catch (error: any) {
    console.error('Error in ensure-user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

