import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

/**
 * PATCH /api/students/me — student self-service update, scoped to the calling
 * token's own user id only (never accepts an id from the URL or body).
 * Uses a session-scoped client so RLS (auth.uid() = id) enforces the scoping
 * as defense in depth, in addition to the explicit .eq("id", user.id) below.
 */
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    const token = authHeader.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase URL or ANON key' },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (body.full_name !== undefined) updateData.full_name = body.full_name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.t_shirt_size !== undefined) updateData.t_shirt_size = body.t_shirt_size;
    if (body.emergency_contact_name !== undefined) updateData.emergency_contact_name = body.emergency_contact_name;
    if (body.emergency_contact_phone !== undefined) updateData.emergency_contact_phone = body.emergency_contact_phone;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: 'No fields to update' });
    }

    const { error } = await supabase.from('students').update(updateData).eq('id', user.id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
