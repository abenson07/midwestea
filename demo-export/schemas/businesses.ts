/**
 * Businesses Schema
 * Based on Supabase schema
 */

export interface Businesses {
  id: string; // uuid
  business_name: string | null; // text
  contact_name: string | null; // text
  email: string | null; // text
  phone: string | null; // text
  address: string | null; // text
  website: string | null; // text
  google_place_id: string | null; // text — optional unique id from Google Places (New)
  contacted: boolean; // outreach tracking
  hidden: boolean; // hide from default lists in the dashboard
  membership_id: string | null; // uuid (references business_memberships)
  notes: string | null; // text
  is_member: boolean; // dashboard flag
  is_past_sponsor: boolean; // dashboard flag
}

export interface BusinessesInsert {
  business_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  google_place_id?: string | null;
  contacted?: boolean;
  hidden?: boolean;
  membership_id?: string | null;
  notes?: string | null;
  is_member?: boolean;
  is_past_sponsor?: boolean;
}

export interface BusinessesUpdate {
  business_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  google_place_id?: string | null;
  contacted?: boolean;
  hidden?: boolean;
  membership_id?: string | null;
  notes?: string | null;
  is_member?: boolean;
  is_past_sponsor?: boolean;
}
