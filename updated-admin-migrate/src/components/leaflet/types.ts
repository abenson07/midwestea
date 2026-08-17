export type LeafletStatus = "planned" | "active" | "closed";

export type DeliveryResponse = "pending" | "confirmed" | "needs_cover" | "rejected";

export type LeafletEdition = {
  id: string;
  title: string;
  distribution_date: string;
  sponsorship_due_date?: string | null;
  delivery_date?: string | null;
  status: LeafletStatus;
  comm_initial_confirmation_sent_at?: string | null;
};

export type Person = {
  id: string;
  full_name: string;
  email: string | null;
  address?: string | null;
};

export type Route = {
  id: string;
  route_name: string;
  route_type: string;
  primary_deliverer_id?: string | null;
};

export type Delivery = {
  id: string;
  leaflet_id: string;
  route_id: string;
  person_id: string | null;
  leaflet_count: number | null;
  is_skipped: boolean;
  response: DeliveryResponse;
  date_delivered: string | null;
  building_contact_name?: string | null;
  building_contact_email?: string | null;
  building_contact_phone?: string | null;
  routes?: Route;
  people?: Person | null;
  countChange?: number | null;
};

export type DeliveryWithRelations = Delivery;

export type Task = {
  id: string;
  title: string;
  offset_days: number;
  is_complete: boolean;
  is_skipped: boolean;
  template_id: string | null;
  group: string;
  dueLabel: string;
  isOverdue?: boolean;
};

export type ScheduleGroupLabel =
  | "Past due"
  | "Six months out"
  | "90 days out"
  | "60 days out"
  | "30 days out"
  | "2 weeks out"
  | "Week of event"
  | "Day of event";

export type OpenRoutePreview = {
  id: string;
  initials: string;
  name: string;
  detail: string;
  dot: "green" | "amber";
};

export type BudgetLineItem = {
  name: string;
  amount: string;
  status: string;
  statusTone: "paid" | "pending";
};

export type StoryItem = {
  id: string;
  date: string;
  time: string;
  type: string;
  title: string;
  status: string;
  badgeColor: string;
  badgeBg: string;
};

export type DelivererCard = {
  id: string;
  name: string;
  email: string;
  address: string | null;
  status: "Confirmed" | "Not confirmed";
  routes: {
    name: string;
    households: string;
    leafletCount: number | null;
    deliveryId?: string;
    routeId?: string;
    isSkipped: boolean;
  }[];
};

export type CommStage = {
  id: string;
  stepKey?: string;
  name: string;
  state: "completed" | "active" | "upcoming";
  sentDate?: string;
  timing?: string;
  description?: string;
  sentCount?: number;
  yes?: number;
  unresponsive?: number;
  no?: number;
  noSkipped?: number;
  noRemoved?: number;
};

export type Substitution = {
  id: string;
  deliveryId: string;
  route: string;
  covering: string;
  forPerson: string;
  date: string;
  status: string;
  coveringEmail?: string;
  coveringPhone?: string;
};

export type Sponsor = {
  id: string;
  business: string;
  contact: string;
  level: string;
  amount: number;
  status: string;
};

export type Invoice = {
  id: string;
  invoice: string;
  sponsor: string;
  amount: number;
  dueDate: string;
  status: string;
  /** Catalog sponsorship_items name, resolved via the invoice's sponsorship_id metadata — unset (or "—") when unresolved. */
  level?: string;
};

export type SponsorshipTier = {
  name: string;
  amount: number;
  quantity: number;
  left: string;
  remaining: number;
  /** Real `sponsorship_items.id` this tier is backed by, when sourced from the catalog. */
  itemId?: string;
};

export type PastDeliverer = {
  id: string;
  name: string;
};

export type DeliveryHistory = {
  label: string;
  count: number;
};
