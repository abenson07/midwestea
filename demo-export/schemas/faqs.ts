/**
 * FAQs Schema
 * Based on Supabase schema (supabase/migrations/20260705120000_faqs.sql)
 */

export interface Faqs {
  id: string; // uuid
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqsInsert {
  question: string;
  answer: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface FaqsUpdate {
  question?: string;
  answer?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface FaqPageAssignments {
  id: string; // uuid
  faq_id: string; // uuid
  page_slug: string;
  sort_order: number;
  created_at: string;
}

export interface FaqPageAssignmentsInsert {
  faq_id: string;
  page_slug: string;
  sort_order?: number;
}

// Known marketing-site routes a FAQ can be surfaced on.
// page_slug in faq_page_assignments is plain text, so new pages can be added
// here without a migration.
export const FAQ_PAGE_OPTIONS: { slug: string; label: string }[] = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "about/maple-leaf", label: "About — Maple Leaf" },
  { slug: "board", label: "Board" },
  { slug: "committees", label: "Committees" },
  { slug: "contact", label: "Contact" },
  { slug: "donate", label: "Donate" },
  { slug: "events", label: "Events" },
  { slug: "join-the-board", label: "Join the Board" },
  { slug: "leaflet", label: "Leaflet" },
  { slug: "meeting-minutes", label: "Meeting Minutes" },
  { slug: "membership", label: "Membership" },
  { slug: "one-seattle-plan", label: "One Seattle Plan" },
  { slug: "submit-event", label: "Submit Event" },
  { slug: "submit-story", label: "Submit Story" },
  { slug: "subscribe", label: "Subscribe" },
  { slug: "volunteer", label: "Volunteer" },
];
