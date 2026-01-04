import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * Submit waitlist form
 * Creates/ensures user exists, creates/ensures student exists, and adds to waitlist
 */
export async function POST(request: NextRequest) {
  try {
    const { email, fullName, courseCode } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!courseCode) {
      return NextResponse.json(
        { error: 'Course code is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // 1. Ensure user exists in auth.users
    let userId: string | null = null;
    
    // Check if user exists
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

    if (existingAuthUser) {
      userId = existingAuthUser.id;
      console.log(`[Waitlist] Email ${email} exists in auth.users`);
    } else {
      // Create new user
      console.log(`[Waitlist] Email ${email} does not exist, creating new user...`);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm email
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: `Failed to create user: ${createError.message}` },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
      console.log(`[Waitlist] New user created for email ${email} with ID: ${userId}`);
    }

    // 2. Ensure student exists
    const { data: existingStudent, error: studentCheckError } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .eq('id', userId)
      .maybeSingle();

    if (studentCheckError) {
      console.error('Error checking student record:', studentCheckError);
      return NextResponse.json(
        { error: 'Failed to check student record' },
        { status: 500 }
      );
    }

    // Parse full name into first and last name
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (!existingStudent) {
      // Create student record
      console.log(`[Waitlist] Creating student record for user ${userId}...`);
      const { data: newStudent, error: createStudentError } = await supabase
        .from('students')
        .insert({
          id: userId,
          first_name: firstName || null,
          last_name: lastName || null,
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

      console.log(`[Waitlist] Student record created for user ${userId}`);
    } else {
      // Update student name if not already set
      if ((!existingStudent.first_name || !existingStudent.last_name) && (firstName || lastName)) {
        console.log(`[Waitlist] Updating student name for user ${userId}...`);
        const { error: updateError } = await supabase
          .from('students')
          .update({
            first_name: existingStudent.first_name || firstName || null,
            last_name: existingStudent.last_name || lastName || null,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating student name:', updateError);
          // Don't fail the request, just log the error
        }
      }
    }

    // 3. Add to waitlist (handle unique constraint)
    const { data: existingWaitlistEntry, error: waitlistCheckError } = await supabase
      .from('waitlist')
      .select('id')
      .eq('student_id', userId)
      .eq('course_code', courseCode.toUpperCase())
      .maybeSingle();

    if (waitlistCheckError) {
      console.error('Error checking waitlist entry:', waitlistCheckError);
      return NextResponse.json(
        { error: 'Failed to check waitlist entry' },
        { status: 500 }
      );
    }

    if (existingWaitlistEntry) {
      // Already on waitlist
      console.log(`[Waitlist] User ${userId} is already on waitlist for course ${courseCode}`);
      return NextResponse.json({
        success: true,
        message: 'You are already on the waitlist for this course',
        alreadyOnWaitlist: true,
      });
    }

    // Create waitlist entry
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from('waitlist')
      .insert({
        student_id: userId,
        course_code: courseCode.toUpperCase(),
      })
      .select()
      .single();

    if (waitlistError) {
      console.error('Error creating waitlist entry:', waitlistError);
      return NextResponse.json(
        { error: `Failed to add to waitlist: ${waitlistError.message}` },
        { status: 500 }
      );
    }

    console.log(`[Waitlist] Successfully added user ${userId} to waitlist for course ${courseCode}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
      waitlistEntry,
    });
  } catch (error: any) {
    console.error('Error in waitlist submit API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



