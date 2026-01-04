import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseCode: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseCode = resolvedParams.courseCode;

    if (!courseCode) {
      return NextResponse.json(
        { error: 'Course code is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseAdminClient();

    // Fetch waitlist entries with student information
    // Note: email is fetched separately via auth.admin.listUsers() since Supabase doesn't allow direct joins to auth.users
    const { data: waitlistEntries, error } = await supabase
      .from('waitlist')
      .select(`
        id,
        student_id,
        course_code,
        created_at,
        updated_at,
        students:student_id (
          id,
          first_name,
          last_name
        )
      `)
      .eq('course_code', courseCode.toUpperCase())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching waitlist:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch waitlist' },
        { status: 500 }
      );
    }

    // Transform the data to include student email from auth.users
    // Note: We'll need to fetch emails separately since Supabase doesn't allow direct joins to auth.users
    const entriesWithEmails = await Promise.all(
      (waitlistEntries || []).map(async (entry: any) => {
        // Get email from auth.users
        let email = null;
        try {
          const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
          if (!authError && users) {
            const user = users.find(u => u.id === entry.student_id);
            email = user?.email || null;
          }
        } catch (err) {
          console.error('Error fetching user email:', err);
        }

        return {
          id: entry.id,
          student_id: entry.student_id,
          course_code: entry.course_code,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          full_name: entry.students 
            ? `${entry.students.first_name || ''} ${entry.students.last_name || ''}`.trim() || null
            : null,
          email: email,
        };
      })
    );

    return NextResponse.json({ waitlist: entriesWithEmails });
  } catch (err: any) {
    console.error('Unexpected error fetching waitlist:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

