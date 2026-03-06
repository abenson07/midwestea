import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';

export const runtime = 'nodejs';

/**
 * GET /api/locations/[id] – get a single location (authenticated).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Location ID is required' },
        { status: 400 }
      );
    }

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

    const { data: location, error } = await supabase
      .from('locations')
      .select('id, location_name, street, city, state, zip, google_maps_url, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, location });
  } catch (err: unknown) {
    console.error('[GET /api/locations/[id]] Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/locations/[id] – update location (admin-only).
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Location ID is required' },
        { status: 400 }
      );
    }

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
    const updateData: Record<string, string | null> = {};
    if (body.locationName !== undefined) updateData.location_name = body.locationName?.trim() || null;
    if (body.street !== undefined) updateData.street = body.street?.trim() || null;
    if (body.city !== undefined) updateData.city = body.city?.trim() || null;
    if (body.state !== undefined) updateData.state = body.state?.trim() || null;
    if (body.zip !== undefined) updateData.zip = body.zip?.trim() || null;
    if (body.googleMapsUrl !== undefined) updateData.google_maps_url = body.googleMapsUrl?.trim() || null;

    if (Object.keys(updateData).length === 0) {
      const { data: existing } = await supabase
        .from('locations')
        .select('id, location_name, street, city, state, zip, google_maps_url, created_at, updated_at')
        .eq('id', id)
        .single();
      return NextResponse.json({ success: true, location: existing });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: location, error } = await supabase
      .from('locations')
      .update(updateData)
      .eq('id', id)
      .select('id, location_name, street, city, state, zip, google_maps_url, created_at, updated_at')
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, location });
  } catch (err: unknown) {
    console.error('[PUT /api/locations/[id]] Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
