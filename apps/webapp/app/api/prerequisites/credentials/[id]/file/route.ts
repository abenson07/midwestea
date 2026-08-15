import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { getCredentialFileSignedUrl } from '@/lib/student-credentials';

export const runtime = 'nodejs';

/**
 * GET /api/prerequisites/credentials/[id]/file
 *
 * Mints a 300-second signed URL for a credential's stored file. Never
 * returns a raw storage path. Requires a valid session token AND admins
 * table membership.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { data: credential, error: credError } = await supabase
      .from('student_credentials')
      .select('file_url')
      .eq('id', id)
      .single();

    if (credError || !credential || !credential.file_url) {
      return NextResponse.json({ success: false, error: 'No file on this credential' }, { status: 404 });
    }

    const { url, error: urlError } = await getCredentialFileSignedUrl(supabase, credential.file_url);
    if (urlError || !url) {
      return NextResponse.json({ success: false, error: urlError || 'Failed to create signed URL.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('[API] Error in credential file route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
