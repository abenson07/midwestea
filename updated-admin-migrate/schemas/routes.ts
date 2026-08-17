/**
 * Routes Schema
 * Based on Supabase schema
 */

export type RouteTypesEnum = string; // public.Route Types

export interface Routes {
  id: string;
  route_name: string;
  leaflet_count: number | null;
  created_at: string | null;
  route_type: RouteTypesEnum | null;
  primary_deliverer_id: string | null;
  primary_deliverer_email: string | null;
  building_contact_name: string | null;
  building_contact_email: string | null;
  building_contact_phone: string | null;
  building_contact_is_deliverer: boolean;
  special_instructions: string | null;
}

export interface RoutesInsert {
  route_name: string;
  leaflet_count?: number | null;
  created_at?: string | null;
  route_type?: RouteTypesEnum | null;
  primary_deliverer_id?: string | null;
  primary_deliverer_email?: string | null;
  building_contact_name?: string | null;
  building_contact_email?: string | null;
  building_contact_phone?: string | null;
  building_contact_is_deliverer?: boolean;
  special_instructions?: string | null;
}

export interface RoutesUpdate {
  route_name?: string;
  leaflet_count?: number | null;
  created_at?: string | null;
  route_type?: RouteTypesEnum | null;
  primary_deliverer_id?: string | null;
  primary_deliverer_email?: string | null;
  building_contact_name?: string | null;
  building_contact_email?: string | null;
  building_contact_phone?: string | null;
  building_contact_is_deliverer?: boolean;
  special_instructions?: string | null;
}
