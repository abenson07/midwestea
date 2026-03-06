"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";

export interface Location {
  id: string;
  location_name: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  google_maps_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LocationsResponse {
  success: boolean;
  locations?: Location[];
  error?: string;
}

export interface LocationResponse {
  success: boolean;
  location?: Location;
  error?: string;
}

function getBasePath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname.startsWith("/app") ? "/app" : "";
}

/**
 * Fetch all locations (for dropdown and locations page).
 */
export async function getLocations(): Promise<LocationsResponse> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { success: false, error: "Not authenticated. Please log in." };
    }

    const response = await fetch(`${getBasePath()}/api/locations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to fetch locations" };
    }
    return { success: true, locations: result.locations ?? [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch locations";
    return { success: false, error: message };
  }
}

/**
 * Fetch a single location by ID.
 */
export async function getLocationById(id: string): Promise<LocationResponse> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { success: false, error: "Not authenticated. Please log in." };
    }

    const response = await fetch(`${getBasePath()}/api/locations/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to fetch location" };
    }
    return { success: true, location: result.location };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch location";
    return { success: false, error: message };
  }
}

/**
 * Create a new location (admin-only).
 */
export async function createLocation(
  locationName: string,
  street?: string | null,
  city?: string | null,
  state?: string | null,
  zip?: string | null,
  googleMapsUrl?: string | null
): Promise<LocationResponse> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { success: false, error: "Not authenticated. Please log in." };
    }

    const response = await fetch(`${getBasePath()}/api/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        locationName: locationName.trim() || null,
        street: street?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zip: zip?.trim() || null,
        googleMapsUrl: googleMapsUrl?.trim() || null,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to create location" };
    }
    return { success: true, location: result.location };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create location";
    return { success: false, error: message };
  }
}

/**
 * Update an existing location (admin-only).
 */
export async function updateLocation(
  id: string,
  updates: {
    locationName?: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    googleMapsUrl?: string | null;
  }
): Promise<LocationResponse> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { success: false, error: "Not authenticated. Please log in." };
    }

    const body: Record<string, string | null> = {};
    if (updates.locationName !== undefined) body.locationName = updates.locationName?.trim() || null;
    if (updates.street !== undefined) body.street = updates.street?.trim() || null;
    if (updates.city !== undefined) body.city = updates.city?.trim() || null;
    if (updates.state !== undefined) body.state = updates.state?.trim() || null;
    if (updates.zip !== undefined) body.zip = updates.zip?.trim() || null;
    if (updates.googleMapsUrl !== undefined) body.googleMapsUrl = updates.googleMapsUrl?.trim() || null;

    const response = await fetch(`${getBasePath()}/api/locations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to update location" };
    }
    return { success: true, location: result.location };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update location";
    return { success: false, error: message };
  }
}
