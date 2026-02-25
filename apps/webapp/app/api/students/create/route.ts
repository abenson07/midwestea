import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { findOrCreateStudent, updateStudentNameIfNeeded, createEnrollment } from '@/lib/enrollments';

export const runtime = 'nodejs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found. Please ensure you are registered as an admin.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, fullName, phone, classId } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    if (classId != null && (typeof classId !== 'string' || !UUID_REGEX.test(classId))) {
      return NextResponse.json(
        { success: false, error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    const student = await findOrCreateStudent(email.trim());
    await updateStudentNameIfNeeded(student.id, fullName.trim());

    if (phone != null && typeof phone === 'string' && phone.trim() !== '') {
      const { error: phoneError } = await supabase
        .from('students')
        .update({ phone: phone.trim() })
        .eq('id', student.id);
      if (phoneError) {
        console.error('[students/create] Failed to update phone:', phoneError);
      }
    }

    let enrollment = null;
    if (classId) {
      enrollment = await createEnrollment(student.id, classId);
    }

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone != null && typeof phone === 'string' ? phone.trim() : student.phone,
      },
      ...(enrollment && { enrollment: { id: enrollment.id } }),
    });
  } catch (err: any) {
    console.error('[students/create] Error:', err);
    const message = err?.message || 'Failed to create student';
    const isDuplicate = /already exists|duplicate|already in use/i.test(message);
    return NextResponse.json(
      { success: false, error: isDuplicate ? 'This email is already in use' : message },
      { status: isDuplicate ? 400 : 500 }
    );
  }
}
