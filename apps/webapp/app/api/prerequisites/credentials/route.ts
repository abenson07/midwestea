import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { submitStudentCredential } from '@/lib/student-credentials';
import { uploadCredentialFile } from '@/lib/prerequisite-uploads';

export const runtime = 'nodejs';

/**
 * Server-side API route to submit a student credential.
 * Requires authentication; studentId is always derived from the verified
 * bearer token, never trusted from the request body.
 */
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const studentId = user.id;

    const formData = await request.formData();
    const prerequisiteTypeId = formData.get('prerequisiteTypeId');
    const submittedForClassId = formData.get('submittedForClassId');
    const valueText = formData.get('valueText');
    const valueDate = formData.get('valueDate');
    const valueBooleanRaw = formData.get('valueBoolean');
    const issuedAt = formData.get('issuedAt');
    const file = formData.get('file');

    if (!prerequisiteTypeId || typeof prerequisiteTypeId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'prerequisiteTypeId is required' },
        { status: 400 }
      );
    }

    let fileUrl: string | null = null;
    if (file && file instanceof File) {
      const { objectPath, error: uploadError } = await uploadCredentialFile(
        supabase,
        studentId,
        prerequisiteTypeId,
        file
      );

      if (uploadError) {
        return NextResponse.json({ success: false, error: uploadError }, { status: 400 });
      }

      fileUrl = objectPath;
    }

    const result = await submitStudentCredential(supabase, {
      studentId,
      prerequisiteTypeId,
      submittedForClassId: typeof submittedForClassId === 'string' ? submittedForClassId : null,
      valueText: typeof valueText === 'string' ? valueText : null,
      valueDate: typeof valueDate === 'string' ? valueDate : null,
      valueBoolean: typeof valueBooleanRaw === 'string' ? valueBooleanRaw === 'true' : null,
      fileUrl,
      issuedAt: typeof issuedAt === 'string' ? issuedAt : null,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, credential: result.credential });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit credential' },
      { status: 500 }
    );
  }
}
