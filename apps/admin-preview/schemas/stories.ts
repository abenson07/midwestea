/**
 * Stories Schema
 * Based on Supabase schema (supabase/migrations/20260707190000_stories.sql)
 */

export type StoryStatus = "draft" | "published";

export interface Stories {
  id: string; // uuid
  title: string;
  author_id: string | null;
  cover_image_url: string | null;
  body: string;
  status: StoryStatus;
  publish_date: string | null;
  leaflet_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoriesInsert {
  title?: string;
  author_id?: string | null;
  cover_image_url?: string | null;
  body?: string;
  status?: StoryStatus;
  publish_date?: string | null;
  leaflet_id?: string | null;
}

export interface StoriesUpdate {
  title?: string;
  author_id?: string | null;
  cover_image_url?: string | null;
  body?: string;
  status?: StoryStatus;
  publish_date?: string | null;
  leaflet_id?: string | null;
}
