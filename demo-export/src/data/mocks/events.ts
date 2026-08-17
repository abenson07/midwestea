import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";

export type EventSummary = {
  id: string;
  title: string;
  date: string;
  location: string;
  committee: CommitteeSlug;
  description: string;
};

/**
 * Demo mode's curated event set — exactly these 5, nothing else. Every
 * per-event mock below (`*ById`) is keyed by these ids.
 */
export const CURATED_DEMO_EVENT_IDS = [
  "evt-summer-social",
  "evt-movies-tower",
  "evt-book-club",
  "evt-community-meeting",
  "evt-halloween-parade",
] as const;

export type CuratedDemoEventId = (typeof CURATED_DEMO_EVENT_IDS)[number];

export const sampleEvents: EventSummary[] = [
  {
    id: "evt-summer-social",
    title: "Summer Social",
    date: "Aug 15, 2026",
    location: "Maple Leaf Park",
    committee: "events",
    description: "Annual neighborhood potluck and live music in the park — the kickoff to fall programming.",
  },
  {
    id: "evt-movies-tower",
    title: "Movie by the Tower",
    date: "Aug 8, 2026",
    location: "Lower Baseball Fields, Maple Leaf Reservoir Park",
    committee: "events",
    description: "Free outdoor movie night for the neighborhood — bring a blanket and low chairs.",
  },
  {
    id: "evt-book-club",
    title: "Book Club",
    date: "Sep 20, 2026",
    location: "Watershed Pub",
    committee: "outreach",
    description: "Monthly silent reading meetup — come solo or bring a friend.",
  },
  {
    id: "evt-community-meeting",
    title: "Community Meeting",
    date: "Oct 14, 2026",
    location: "Olympic View Elementary",
    committee: "steering",
    description: "Quarterly community council meeting open to all residents.",
  },
  {
    id: "evt-halloween-parade",
    title: "Halloween Parade",
    date: "Oct 25, 2026",
    location: "Maple Leaf",
    committee: "events",
    description: "Costumed neighborhood parade for kids and families.",
  },
];

export type EventDetail = {
  id: string;
  title: string;
  committee: CommitteeSlug;
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: string;
};

/** ISO date per curated event — used to bucket tasks into "days out" groups. */
export const eventDateIsoById: Record<CuratedDemoEventId, string> = {
  "evt-summer-social": "2026-08-15",
  "evt-movies-tower": "2026-08-08",
  "evt-book-club": "2026-09-20",
  "evt-community-meeting": "2026-10-14",
  "evt-halloween-parade": "2026-10-25",
};

export const sampleEventDetailById: Record<CuratedDemoEventId, EventDetail> = {
  "evt-summer-social": {
    id: "evt-summer-social",
    title: "Summer Social",
    committee: "events",
    date: "Aug 15, 2026",
    time: "5:00 PM – 8:00 PM",
    location: "Maple Leaf Park",
    description:
      "Annual neighborhood-wide potluck with live music from a local band — bring a dish to share and a chair. Kid-friendly, dog-friendly.",
    organizer: `${COMMITTEE_LABELS.events} Committee`,
  },
  "evt-movies-tower": {
    id: "evt-movies-tower",
    title: "Movie by the Tower",
    committee: "events",
    date: "Aug 8, 2026",
    time: "8:30 PM – 10:30 PM",
    location: "Lower Baseball Fields, Maple Leaf Reservoir Park",
    description:
      "Free outdoor movie night for the neighborhood — bring a blanket and low chairs. Concessions run by the Events Committee, with proceeds going toward the fall park cleanup.",
    organizer: `${COMMITTEE_LABELS.events} Committee`,
  },
  "evt-book-club": {
    id: "evt-book-club",
    title: "Book Club",
    committee: "outreach",
    date: "Sep 20, 2026",
    time: "7:00 PM – 8:30 PM",
    location: "Watershed Pub",
    description:
      "Monthly silent reading meetup in the back room at Watershed Pub — bring whatever you're reading and read quietly alongside neighbors. Casual chat after.",
    organizer: `${COMMITTEE_LABELS.outreach} Committee`,
  },
  "evt-community-meeting": {
    id: "evt-community-meeting",
    title: "Community Meeting",
    committee: "steering",
    date: "Oct 14, 2026",
    time: "7:00 PM – 8:30 PM",
    location: "Olympic View Elementary, Cafeteria",
    description:
      "Quarterly community council meeting open to all residents — budget update, committee reports, and open floor for neighborhood concerns.",
    organizer: `${COMMITTEE_LABELS.steering} Committee`,
  },
  "evt-halloween-parade": {
    id: "evt-halloween-parade",
    title: "Halloween Parade",
    committee: "events",
    date: "Oct 25, 2026",
    time: "3:00 PM – 5:00 PM",
    location: "Maple Leaf — starts at 92nd & Roosevelt",
    description:
      "Costumed neighborhood parade for kids and families, ending with a costume contest and candy station at the park. Streets close to through-traffic for the route.",
    organizer: `${COMMITTEE_LABELS.events} Committee`,
  },
};

export type EventVolunteerRow = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "Confirmed" | "Invited" | "Declined";
};

export type EventBudgetSummary = {
  totalBudget: number;
  received: number;
  pending: number;
};

/** Derived from each event's budget items: Paid → received, Pending + Overdue → pending. */
export const sampleEventBudgetSummaryById: Record<CuratedDemoEventId, EventBudgetSummary> = {
  "evt-summer-social": { totalBudget: 1800, received: 950, pending: 400 },
  "evt-movies-tower": { totalBudget: 2500, received: 1075, pending: 465 },
  "evt-book-club": { totalBudget: 250, received: 150, pending: 60 },
  "evt-community-meeting": { totalBudget: 450, received: 300, pending: 150 },
  "evt-halloween-parade": { totalBudget: 1400, received: 900, pending: 300 },
};

export type EventBudgetRow = {
  id: string;
  invoiceNumber: string;
  item: string;
  vendor: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
  dueDate: string;
};

export const sampleEventBudgetItemsById: Record<CuratedDemoEventId, EventBudgetRow[]> = {
  "evt-summer-social": [
    { id: "bud-ss-1", invoiceNumber: "INV-4001", item: "Park use permit", vendor: "Seattle Parks & Recreation", amount: "$75.00", status: "Paid", dueDate: "Jul 10, 2026" },
    { id: "bud-ss-2", invoiceNumber: "INV-4002", item: "Tent & table rental", vendor: "Cort Party Rental", amount: "$375.00", status: "Paid", dueDate: "Jul 20, 2026" },
    { id: "bud-ss-3", invoiceNumber: "INV-4003", item: "Live band", vendor: "The Roosevelt Ramblers", amount: "$500.00", status: "Pending", dueDate: "Aug 10, 2026" },
    { id: "bud-ss-4", invoiceNumber: "INV-4004", item: "Paper goods & utensils", vendor: "Costco Business Center", amount: "$95.00", status: "Pending", dueDate: "Aug 10, 2026" },
  ],
  "evt-movies-tower": [
    { id: "bud-mt-1", invoiceNumber: "INV-2031", item: "Screen & projector rental", vendor: "Emerald City AV", amount: "$650.00", status: "Paid", dueDate: "Jul 15, 2026" },
    { id: "bud-mt-2", invoiceNumber: "INV-2032", item: "Film licensing", vendor: "Swank Motion Pictures", amount: "$425.00", status: "Paid", dueDate: "Jul 20, 2026" },
    { id: "bud-mt-3", invoiceNumber: "INV-2033", item: "Concessions supplies", vendor: "Costco Business Center", amount: "$180.00", status: "Pending", dueDate: "Aug 5, 2026" },
    { id: "bud-mt-4", invoiceNumber: "INV-2034", item: "Park use permit", vendor: "Seattle Parks & Recreation", amount: "$75.00", status: "Pending", dueDate: "Aug 5, 2026" },
    { id: "bud-mt-5", invoiceNumber: "INV-2035", item: "Portable restrooms", vendor: "Northwest Cascade", amount: "$210.00", status: "Overdue", dueDate: "Jul 25, 2026" },
  ],
  "evt-book-club": [
    { id: "bud-bc-1", invoiceNumber: "INV-5001", item: "Room donation (thank-you gift card)", vendor: "Watershed Pub", amount: "$50.00", status: "Paid", dueDate: "Sep 1, 2026" },
    { id: "bud-bc-2", invoiceNumber: "INV-5002", item: "Book stipend (5 copies)", vendor: "Third Place Books", amount: "$100.00", status: "Paid", dueDate: "Sep 5, 2026" },
    { id: "bud-bc-3", invoiceNumber: "INV-5003", item: "Snacks", vendor: "Maple Leaf Grocery", amount: "$60.00", status: "Pending", dueDate: "Sep 18, 2026" },
  ],
  "evt-community-meeting": [
    { id: "bud-cm-1", invoiceNumber: "INV-6001", item: "Cafeteria rental", vendor: "Seattle Public Schools", amount: "$150.00", status: "Paid", dueDate: "Sep 20, 2026" },
    { id: "bud-cm-2", invoiceNumber: "INV-6002", item: "AV rental", vendor: "Emerald City AV", amount: "$150.00", status: "Paid", dueDate: "Sep 25, 2026" },
    { id: "bud-cm-3", invoiceNumber: "INV-6003", item: "Printed agendas & handouts", vendor: "FedEx Office", amount: "$45.00", status: "Pending", dueDate: "Oct 10, 2026" },
    { id: "bud-cm-4", invoiceNumber: "INV-6004", item: "Coffee & light refreshments", vendor: "Maple Leaf Grocery", amount: "$105.00", status: "Pending", dueDate: "Oct 12, 2026" },
  ],
  "evt-halloween-parade": [
    { id: "bud-hp-1", invoiceNumber: "INV-7001", item: "Route/street closure permit", vendor: "Seattle Dept. of Transportation", amount: "$120.00", status: "Paid", dueDate: "Sep 20, 2026" },
    { id: "bud-hp-2", invoiceNumber: "INV-7002", item: "Candy & treats", vendor: "Costco Business Center", amount: "$450.00", status: "Paid", dueDate: "Oct 5, 2026" },
    { id: "bud-hp-3", invoiceNumber: "INV-7003", item: "Costume contest prizes", vendor: "Third Place Books", amount: "$150.00", status: "Pending", dueDate: "Oct 15, 2026" },
    { id: "bud-hp-4", invoiceNumber: "INV-7004", item: "PA / sound system rental", vendor: "Emerald City AV", amount: "$180.00", status: "Pending", dueDate: "Oct 18, 2026" },
  ],
};

export type EventSponsorshipInvoiceRow = {
  id: string;
  invoiceNumber: string;
  business: string;
  level: string;
  amount: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
};

/**
 * Invoices billed to sponsoring businesses for their sponsorship level, per event.
 * Only $-denominated tiers get invoices — $0 tiers (e.g. Non-profit table) and
 * in-kind items aren't invoiced. For high-volume tiers (Summer Social's Table),
 * this is a representative subset, not one row per unit sold — see
 * `sampleEventSponsorshipLevelsById` for the real quantityFilled counts.
 */
export const sampleEventSponsorshipInvoicesById: Record<CuratedDemoEventId, EventSponsorshipInvoiceRow[]> = {
  "evt-summer-social": [
    { id: "spon-inv-ss-1", invoiceNumber: "INV-4101", business: "Third Place Books", level: "Table", amount: "$200.00", dueDate: "Jul 20, 2026", status: "Paid" },
    { id: "spon-inv-ss-2", invoiceNumber: "INV-4102", business: "Watershed Pub", level: "Table", amount: "$200.00", dueDate: "Jul 22, 2026", status: "Paid" },
    { id: "spon-inv-ss-3", invoiceNumber: "INV-4103", business: "Maple Leaf Grocery", level: "Table", amount: "$200.00", dueDate: "Jul 22, 2026", status: "Paid" },
    { id: "spon-inv-ss-4", invoiceNumber: "INV-4104", business: "Corliss Coffee", level: "Table", amount: "$200.00", dueDate: "Jul 10, 2026", status: "Overdue" },
    { id: "spon-inv-ss-5", invoiceNumber: "INV-4105", business: "Alfa Pizzeria", level: "Table", amount: "$200.00", dueDate: "Aug 8, 2026", status: "Pending" },
  ],
  "evt-movies-tower": [
    { id: "spon-inv-1", invoiceNumber: "INV-3001", business: "Third Place Books", level: "Presenting", amount: "$2,500.00", dueDate: "Jul 10, 2026", status: "Paid" },
    { id: "spon-inv-2", invoiceNumber: "INV-3002", business: "Watershed Pub", level: "Supporting Sponsor", amount: "$1,000.00", dueDate: "Jul 12, 2026", status: "Paid" },
    { id: "spon-inv-3", invoiceNumber: "INV-3003", business: "Maple Leaf Grocery", level: "Supporting Sponsor", amount: "$1,000.00", dueDate: "Jul 12, 2026", status: "Paid" },
    { id: "spon-inv-4", invoiceNumber: "INV-3004", business: "Elemental Pizza", level: "Film Sponsor", amount: "$500.00", dueDate: "Jul 15, 2026", status: "Paid" },
    { id: "spon-inv-5", invoiceNumber: "INV-3005", business: "Byrek Bakery", level: "Film Sponsor", amount: "$500.00", dueDate: "Jul 15, 2026", status: "Paid" },
    { id: "spon-inv-6", invoiceNumber: "INV-3006", business: "Corliss Coffee", level: "Film Sponsor", amount: "$500.00", dueDate: "Jul 18, 2026", status: "Paid" },
    { id: "spon-inv-7", invoiceNumber: "INV-3007", business: "Zoka Coffee", level: "Film Sponsor", amount: "$500.00", dueDate: "Aug 1, 2026", status: "Pending" },
    { id: "spon-inv-8", invoiceNumber: "INV-3008", business: "Maple Leaf Grill", level: "Neighborhood Sponsor", amount: "$250.00", dueDate: "Jul 20, 2026", status: "Paid" },
    { id: "spon-inv-9", invoiceNumber: "INV-3009", business: "Alfa Pizzeria", level: "Neighborhood Sponsor", amount: "$250.00", dueDate: "Jul 20, 2026", status: "Paid" },
    { id: "spon-inv-10", invoiceNumber: "INV-3010", business: "Third Place Books", level: "Neighborhood Sponsor", amount: "$250.00", dueDate: "Aug 1, 2026", status: "Pending" },
    { id: "spon-inv-11", invoiceNumber: "INV-3011", business: "Watershed Pub", level: "Neighborhood Sponsor", amount: "$250.00", dueDate: "Jul 10, 2026", status: "Overdue" },
    { id: "spon-inv-12", invoiceNumber: "INV-3012", business: "Byrek Bakery", level: "Neighborhood Sponsor", amount: "$250.00", dueDate: "Aug 1, 2026", status: "Pending" },
    { id: "spon-inv-13", invoiceNumber: "INV-3013", business: "Corliss Coffee", level: "Neighborhood Sponsor", amount: "$250.00", dueDate: "Jul 12, 2026", status: "Overdue" },
  ],
  "evt-book-club": [],
  "evt-community-meeting": [],
  "evt-halloween-parade": [],
};

export type EventSponsorStatus = "Confirmed" | "Pending" | "Declined";

export type EventSponsorRow = {
  id: string;
  name: string;
  tier: string;
  status: EventSponsorStatus;
};

/**
 * Named sponsors per event. Book Club and Community Meeting have none.
 * For Summer Social's high-volume tiers (28 tables, 7 non-profit tables) this
 * is a representative subset of real businesses, not every purchaser —
 * see `sampleEventSponsorshipLevelsById` for the actual filled counts.
 */
export const sampleEventSponsorsById: Record<CuratedDemoEventId, EventSponsorRow[]> = {
  "evt-summer-social": [
    { id: "spon-ss-1", name: "Third Place Books", tier: "Table", status: "Confirmed" },
    { id: "spon-ss-2", name: "Watershed Pub", tier: "Table", status: "Confirmed" },
    { id: "spon-ss-3", name: "Maple Leaf Grocery", tier: "Table", status: "Confirmed" },
    { id: "spon-ss-4", name: "Corliss Coffee", tier: "Table", status: "Confirmed" },
    { id: "spon-ss-5", name: "Alfa Pizzeria", tier: "Table", status: "Pending" },
    { id: "spon-ss-6", name: "Elemental Pizza", tier: "Non-profit table", status: "Confirmed" },
    { id: "spon-ss-7", name: "Byrek Bakery", tier: "Non-profit table", status: "Confirmed" },
    { id: "spon-ss-8", name: "Maple Leaf Grill", tier: "Ice Cream (in-kind)", status: "Confirmed" },
    { id: "spon-ss-9", name: "Zoka Coffee", tier: "Band (in-kind)", status: "Confirmed" },
  ],
  "evt-movies-tower": [
    { id: "spon-1", name: "Third Place Books", tier: "Presenting", status: "Confirmed" },
    { id: "spon-2", name: "Watershed Pub", tier: "Supporting Sponsor", status: "Confirmed" },
    { id: "spon-3", name: "Maple Leaf Grocery", tier: "Supporting Sponsor", status: "Confirmed" },
    { id: "spon-4", name: "Elemental Pizza", tier: "Film Sponsor", status: "Confirmed" },
    { id: "spon-5", name: "Byrek Bakery", tier: "Film Sponsor", status: "Confirmed" },
    { id: "spon-6", name: "Corliss Coffee", tier: "Film Sponsor", status: "Confirmed" },
    { id: "spon-7", name: "Zoka Coffee", tier: "Film Sponsor", status: "Pending" },
    { id: "spon-8", name: "Maple Leaf Grill", tier: "Neighborhood Sponsor", status: "Confirmed" },
    { id: "spon-9", name: "Alfa Pizzeria", tier: "Neighborhood Sponsor", status: "Confirmed" },
    { id: "spon-10", name: "Third Place Books", tier: "Neighborhood Sponsor", status: "Pending" },
    { id: "spon-11", name: "Watershed Pub", tier: "Neighborhood Sponsor", status: "Confirmed" },
    { id: "spon-12", name: "Byrek Bakery", tier: "Neighborhood Sponsor", status: "Pending" },
    { id: "spon-13", name: "Corliss Coffee", tier: "Neighborhood Sponsor", status: "Confirmed" },
  ],
  "evt-book-club": [],
  "evt-community-meeting": [],
  "evt-halloween-parade": [{ id: "spon-hp-1", name: "Watershed Pub", tier: "Band (in-kind)", status: "Confirmed" }],
};

export type EventSponsorshipLevel = {
  id: string;
  name: string;
  price: string;
  quantityAvailable: number;
  quantityFilled: number;
};

/**
 * quantityFilled is the real count (Confirmed + Pending signups against that
 * tier) — for Summer Social's Table/Non-profit tiers this is larger than the
 * number of named rows in `sampleEventSponsorsById` (see note there).
 */
export const sampleEventSponsorshipLevelsById: Record<CuratedDemoEventId, EventSponsorshipLevel[]> = {
  "evt-summer-social": [
    { id: "level-ss-table", name: "Table", price: "$200", quantityAvailable: 28, quantityFilled: 22 },
    { id: "level-ss-nonprofit", name: "Non-profit table", price: "$0", quantityAvailable: 7, quantityFilled: 6 },
    { id: "level-ss-icecream", name: "Ice Cream (in-kind)", price: "In-kind", quantityAvailable: 1, quantityFilled: 1 },
    { id: "level-ss-facepainter", name: "Face Painter (in-kind)", price: "In-kind", quantityAvailable: 1, quantityFilled: 0 },
    { id: "level-ss-band", name: "Band (in-kind)", price: "In-kind", quantityAvailable: 1, quantityFilled: 1 },
  ],
  "evt-movies-tower": [
    { id: "level-presenting", name: "Presenting", price: "$2,500", quantityAvailable: 1, quantityFilled: 1 },
    { id: "level-supporting", name: "Supporting Sponsor", price: "$1,000", quantityAvailable: 3, quantityFilled: 2 },
    { id: "level-film", name: "Film Sponsor", price: "$500", quantityAvailable: 5, quantityFilled: 4 },
    { id: "level-neighborhood", name: "Neighborhood Sponsor", price: "$250", quantityAvailable: 8, quantityFilled: 6 },
  ],
  "evt-book-club": [],
  "evt-community-meeting": [],
  "evt-halloween-parade": [
    { id: "level-hp-band", name: "Band (in-kind)", price: "In-kind", quantityAvailable: 1, quantityFilled: 1 },
  ],
};

export type EventTaskGroupLabel =
  | "Past due"
  | "6 months out"
  | "90 days out"
  | "60 days out"
  | "30 days out"
  | "2 weeks out"
  | "Week of event"
  | "Day of event";

export const EVENT_TASK_GROUP_ORDER: EventTaskGroupLabel[] = [
  "Past due",
  "6 months out",
  "90 days out",
  "60 days out",
  "30 days out",
  "2 weeks out",
  "Week of event",
  "Day of event",
];

/** Buckets a due date against the event date — same offsets as the leaflet schedule. */
export function eventTaskGroupForOffset(daysBeforeEvent: number): Exclude<EventTaskGroupLabel, "Past due"> {
  if (daysBeforeEvent <= 0) return "Day of event";
  if (daysBeforeEvent <= 7) return "Week of event";
  if (daysBeforeEvent <= 14) return "2 weeks out";
  if (daysBeforeEvent <= 30) return "30 days out";
  if (daysBeforeEvent <= 60) return "60 days out";
  if (daysBeforeEvent <= 90) return "90 days out";
  return "6 months out";
}

export function eventTaskGroupForDueDate(dueDateIso: string, eventDateIso: string): EventTaskGroupLabel {
  const due = new Date(`${dueDateIso}T00:00:00`);
  const event = new Date(`${eventDateIso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) return "Past due";

  const daysBeforeEvent = Math.round((event.getTime() - due.getTime()) / 86_400_000);
  return eventTaskGroupForOffset(daysBeforeEvent);
}

export function formatEventTaskDueLabel(dueDateIso: string, isOverdue: boolean): string {
  const due = new Date(`${dueDateIso}T00:00:00`);
  const dueStr = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return isOverdue ? `Due ${dueStr} — overdue` : `Due ${dueStr}`;
}

export type EventTaskRow = {
  id: string;
  title: string;
  group: EventTaskGroupLabel;
  dueLabel: string;
  isComplete: boolean;
  isOverdue: boolean;
};

export const sampleEventTasksById: Record<CuratedDemoEventId, EventTaskRow[]> = {
  "evt-summer-social": [
    { id: "task-ss-1", title: "Reserve park use permit", group: "60 days out", dueLabel: "Completed Jul 10", isComplete: true, isOverdue: false },
    { id: "task-ss-2", title: "Book tent & table rental", group: "30 days out", dueLabel: "Completed Jul 20", isComplete: true, isOverdue: false },
    { id: "task-ss-3", title: "Confirm live band", group: "2 weeks out", dueLabel: "Due Aug 10", isComplete: false, isOverdue: false },
    { id: "task-ss-4", title: "Order paper goods & utensils", group: "2 weeks out", dueLabel: "Due Aug 10", isComplete: false, isOverdue: false },
    { id: "task-ss-5", title: "Post day-of reminder on social", group: "Day of event", dueLabel: "Due Aug 15", isComplete: false, isOverdue: false },
  ],
  "evt-movies-tower": [
    { id: "task-1", title: "Reserve park use permit", group: "60 days out", dueLabel: "Completed Jun 9", isComplete: true, isOverdue: false },
    { id: "task-2", title: "Confirm film licensing", group: "30 days out", dueLabel: "Completed Jul 9", isComplete: true, isOverdue: false },
    { id: "task-3", title: "Book screen & projector rental", group: "2 weeks out", dueLabel: "Completed Jul 25", isComplete: true, isOverdue: false },
    { id: "task-4", title: "Confirm volunteer shifts", group: "Week of event", dueLabel: "Completed Aug 4", isComplete: true, isOverdue: false },
    { id: "task-5", title: "Order concessions supplies", group: "Past due", dueLabel: "Due Aug 5 — overdue", isComplete: false, isOverdue: true },
    { id: "task-6", title: "Pick up portable restrooms", group: "Day of event", dueLabel: "Due Aug 8", isComplete: false, isOverdue: false },
    { id: "task-7", title: "Set up screen & seating area", group: "Day of event", dueLabel: "Due Aug 8", isComplete: false, isOverdue: false },
    { id: "task-8", title: "Post day-of reminder on social", group: "Day of event", dueLabel: "Due Aug 8", isComplete: false, isOverdue: false },
  ],
  "evt-book-club": [
    { id: "task-bc-1", title: "Pick next book", group: "30 days out", dueLabel: "Completed Aug 20", isComplete: true, isOverdue: false },
    { id: "task-bc-2", title: "Reserve back room at Watershed Pub", group: "2 weeks out", dueLabel: "Completed Sep 6", isComplete: true, isOverdue: false },
    { id: "task-bc-3", title: "Order snacks", group: "Week of event", dueLabel: "Due Sep 18", isComplete: false, isOverdue: false },
    { id: "task-bc-4", title: "Post reminder in newsletter", group: "Day of event", dueLabel: "Due Sep 20", isComplete: false, isOverdue: false },
  ],
  "evt-community-meeting": [
    { id: "task-cm-1", title: "Reserve cafeteria", group: "30 days out", dueLabel: "Completed Sep 14", isComplete: true, isOverdue: false },
    { id: "task-cm-2", title: "Prep agenda & committee reports", group: "2 weeks out", dueLabel: "Completed Sep 30", isComplete: true, isOverdue: false },
    { id: "task-cm-3", title: "Print handouts", group: "Week of event", dueLabel: "Due Oct 10", isComplete: false, isOverdue: false },
    { id: "task-cm-4", title: "Publish minutes", group: "Day of event", dueLabel: "Due Oct 14", isComplete: false, isOverdue: false },
  ],
  "evt-halloween-parade": [
    { id: "task-hp-1", title: "Secure route/street closure permit", group: "30 days out", dueLabel: "Completed Sep 20", isComplete: true, isOverdue: false },
    { id: "task-hp-2", title: "Order candy & treats", group: "2 weeks out", dueLabel: "Completed Oct 5", isComplete: true, isOverdue: false },
    { id: "task-hp-3", title: "Recruit route safety volunteers", group: "2 weeks out", dueLabel: "Completed Oct 11", isComplete: true, isOverdue: false },
    { id: "task-hp-4", title: "Confirm costume contest judges", group: "Week of event", dueLabel: "Due Oct 18", isComplete: false, isOverdue: false },
    { id: "task-hp-5", title: "Day-of route setup & signage", group: "Day of event", dueLabel: "Due Oct 25", isComplete: false, isOverdue: false },
  ],
};

export type EventPromotionType = "email" | "social";
export type EventPromotionStatus = "Sent" | "Scheduled" | "Draft";

export type EventPromotionItem = {
  id: string;
  type: EventPromotionType;
  channel: string;
  title: string;
  description: string;
  sendDate: string;
  status: EventPromotionStatus;
};

/** Ordered chronologically — the promotion timeline leading up to each event. */
export const sampleEventPromotionItemsById: Record<CuratedDemoEventId, EventPromotionItem[]> = {
  "evt-summer-social": [
    { id: "promo-ss-1", type: "email", channel: "Newsletter", title: "Save the date — Summer Social", description: "Blurb in the July newsletter announcing the date and potluck theme.", sendDate: "Jul 20, 2026", status: "Sent" },
    { id: "promo-ss-2", type: "social", channel: "Instagram", title: "Announcement post", description: "Feed post with the date, location, and what to bring.", sendDate: "Jul 28, 2026", status: "Sent" },
    { id: "promo-ss-3", type: "email", channel: "Newsletter", title: "One week away reminder", description: "Reminder email with potluck sign-up link and parking details.", sendDate: "Aug 8, 2026", status: "Scheduled" },
  ],
  "evt-movies-tower": [
    { id: "promo-1", type: "email", channel: "Newsletter", title: "Save the date — Movie by the Tower", description: "Blurb in the July newsletter announcing the date and location.", sendDate: "Jul 18, 2026", status: "Sent" },
    { id: "promo-2", type: "social", channel: "Instagram", title: "Announcement post", description: "Feed post with the movie title, date, and a link to RSVP.", sendDate: "Jul 25, 2026", status: "Sent" },
    { id: "promo-3", type: "email", channel: "Newsletter", title: "One week away reminder", description: "Reminder email with parking, seating, and concessions details.", sendDate: "Aug 1, 2026", status: "Scheduled" },
    { id: "promo-4", type: "social", channel: "Facebook", title: "Event reminder", description: "Boost the Facebook event page and tag local business sponsors.", sendDate: "Aug 4, 2026", status: "Scheduled" },
    { id: "promo-5", type: "social", channel: "Instagram", title: "Countdown story", description: "Story countdown sticker with a swipe-up link to the event page.", sendDate: "Aug 7, 2026", status: "Draft" },
    { id: "promo-6", type: "email", channel: "Newsletter", title: "Day-of reminder", description: "Final reminder with the day's schedule and what to bring.", sendDate: "Aug 8, 2026", status: "Draft" },
  ],
  "evt-book-club": [
    { id: "promo-bc-1", type: "email", channel: "Newsletter", title: "This month's pick", description: "Newsletter blurb announcing the book and meetup date.", sendDate: "Sep 1, 2026", status: "Sent" },
    { id: "promo-bc-2", type: "social", channel: "Instagram", title: "Reminder post", description: "Feed post reminding neighbors to bring whatever they're reading.", sendDate: "Sep 17, 2026", status: "Scheduled" },
  ],
  "evt-community-meeting": [
    { id: "promo-cm-1", type: "email", channel: "Newsletter", title: "Save the date — Community Meeting", description: "Newsletter blurb with agenda preview and RSVP link.", sendDate: "Sep 25, 2026", status: "Sent" },
    { id: "promo-cm-2", type: "social", channel: "Facebook", title: "Event reminder", description: "Facebook event page boost with the finalized agenda.", sendDate: "Oct 10, 2026", status: "Scheduled" },
  ],
  "evt-halloween-parade": [
    { id: "promo-hp-1", type: "email", channel: "Newsletter", title: "Save the date — Halloween Parade", description: "Newsletter blurb announcing the route and costume contest.", sendDate: "Sep 25, 2026", status: "Sent" },
    { id: "promo-hp-2", type: "social", channel: "Instagram", title: "Route announcement", description: "Feed post with a map of the parade route and start time.", sendDate: "Oct 10, 2026", status: "Sent" },
    { id: "promo-hp-3", type: "social", channel: "Facebook", title: "Event reminder", description: "Boost the Facebook event page and tag candy-station sponsors.", sendDate: "Oct 20, 2026", status: "Scheduled" },
  ],
};

/** Bundle of every per-event mock for a single curated event id, for convenient lookup. */
export function eventMocksFor(eventId: string) {
  const id = eventId as CuratedDemoEventId;
  return {
    dateIso: eventDateIsoById[id],
    detail: sampleEventDetailById[id],
    budgetSummary: sampleEventBudgetSummaryById[id],
    budgetItems: sampleEventBudgetItemsById[id],
    sponsors: sampleEventSponsorsById[id],
    sponsorshipInvoices: sampleEventSponsorshipInvoicesById[id],
    sponsorshipLevels: sampleEventSponsorshipLevelsById[id],
    tasks: sampleEventTasksById[id],
    promotionItems: sampleEventPromotionItemsById[id],
    volunteerAsks: sampleVolunteerAsksById[id],
  };
}

// --- Volunteers vs. volunteer asks --------------------------------------
//
// Shaped to match what `VolunteersPage.tsx`'s `rowsFromAsks()` actually
// reads (`ask.title`, `ask.signups[].status`, `signup.person.full_name`),
// a structural subset of the real `VolunteerAskWithSignups` type.

export type DemoVolunteerSignup = {
  id: string;
  status: "pending" | "accepted";
  person: { full_name: string; email?: string | null; phone?: string | null };
};

export type DemoVolunteerAsk = {
  id: string;
  title: string;
  event_id: CuratedDemoEventId;
  committee: string | null;
  quantity: number;
  signup_count: number;
  remaining_slots: number;
  signups: DemoVolunteerSignup[];
};

/**
 * Book Club, Community Meeting, and Halloween Parade show committed
 * volunteers (asks fully filled, all signups accepted). Summer Social and
 * Movie by the Tower show open asks that still need signups.
 */
export const sampleVolunteerAsksById: Record<CuratedDemoEventId, DemoVolunteerAsk[]> = {
  "evt-summer-social": [
    {
      id: "ask-ss-1",
      title: "Setup Crew",
      event_id: "evt-summer-social",
      committee: "events",
      quantity: 4,
      signup_count: 2,
      remaining_slots: 2,
      signups: [
        { id: "signup-ss-1", status: "accepted", person: { full_name: "Marcus Ianelli", email: "marcus.ianelli@example.com" } },
        { id: "signup-ss-2", status: "pending", person: { full_name: "Sam Okafor", email: "sam.okafor@example.com" } },
      ],
    },
    {
      id: "ask-ss-2",
      title: "Potluck Table Coordinator",
      event_id: "evt-summer-social",
      committee: "events",
      quantity: 2,
      signup_count: 0,
      remaining_slots: 2,
      signups: [],
    },
  ],
  "evt-movies-tower": [
    {
      id: "ask-mt-1",
      title: "Concessions",
      event_id: "evt-movies-tower",
      committee: "events",
      quantity: 3,
      signup_count: 1,
      remaining_slots: 2,
      signups: [
        { id: "signup-mt-1", status: "accepted", person: { full_name: "Dana Whitfield", email: "dana.whitfield@example.com" } },
      ],
    },
    {
      id: "ask-mt-2",
      title: "Parking & Traffic",
      event_id: "evt-movies-tower",
      committee: "events",
      quantity: 2,
      signup_count: 0,
      remaining_slots: 2,
      signups: [],
    },
  ],
  "evt-book-club": [
    {
      id: "ask-bc-1",
      title: "Discussion Facilitator",
      event_id: "evt-book-club",
      committee: "outreach",
      quantity: 1,
      signup_count: 1,
      remaining_slots: 0,
      signups: [
        { id: "signup-bc-1", status: "accepted", person: { full_name: "Priya Anand", email: "priya.anand@example.com" } },
      ],
    },
    {
      id: "ask-bc-2",
      title: "Snacks & Setup",
      event_id: "evt-book-club",
      committee: "outreach",
      quantity: 2,
      signup_count: 2,
      remaining_slots: 0,
      signups: [
        { id: "signup-bc-2", status: "accepted", person: { full_name: "Lena Brandt", email: "lena.brandt@example.com" } },
        { id: "signup-bc-3", status: "accepted", person: { full_name: "Owen Castillo", email: "owen.castillo@example.com" } },
      ],
    },
  ],
  "evt-community-meeting": [
    {
      id: "ask-cm-1",
      title: "Greeter",
      event_id: "evt-community-meeting",
      committee: "steering",
      quantity: 2,
      signup_count: 2,
      remaining_slots: 0,
      signups: [
        { id: "signup-cm-1", status: "accepted", person: { full_name: "Priya Anand", email: "priya.anand@example.com" } },
        { id: "signup-cm-2", status: "accepted", person: { full_name: "Sam Okafor", email: "sam.okafor@example.com" } },
      ],
    },
    {
      id: "ask-cm-2",
      title: "Note-taker",
      event_id: "evt-community-meeting",
      committee: "steering",
      quantity: 1,
      signup_count: 1,
      remaining_slots: 0,
      signups: [
        { id: "signup-cm-3", status: "accepted", person: { full_name: "Dana Whitfield", email: "dana.whitfield@example.com" } },
      ],
    },
  ],
  "evt-halloween-parade": [
    {
      id: "ask-hp-1",
      title: "Parade Marshal",
      event_id: "evt-halloween-parade",
      committee: "events",
      quantity: 2,
      signup_count: 2,
      remaining_slots: 0,
      signups: [
        { id: "signup-hp-1", status: "accepted", person: { full_name: "Marcus Ianelli", email: "marcus.ianelli@example.com" } },
        { id: "signup-hp-2", status: "accepted", person: { full_name: "Owen Castillo", email: "owen.castillo@example.com" } },
      ],
    },
    {
      id: "ask-hp-2",
      title: "Candy Station",
      event_id: "evt-halloween-parade",
      committee: "events",
      quantity: 3,
      signup_count: 3,
      remaining_slots: 0,
      signups: [
        { id: "signup-hp-3", status: "accepted", person: { full_name: "Lena Brandt", email: "lena.brandt@example.com" } },
        { id: "signup-hp-4", status: "accepted", person: { full_name: "Priya Anand", email: "priya.anand@example.com" } },
        { id: "signup-hp-5", status: "accepted", person: { full_name: "Sam Okafor", email: "sam.okafor@example.com" } },
      ],
    },
    {
      id: "ask-hp-3",
      title: "Route Safety",
      event_id: "evt-halloween-parade",
      committee: "events",
      quantity: 2,
      signup_count: 2,
      remaining_slots: 0,
      signups: [
        { id: "signup-hp-6", status: "accepted", person: { full_name: "Dana Whitfield", email: "dana.whitfield@example.com" } },
        { id: "signup-hp-7", status: "accepted", person: { full_name: "Marcus Ianelli", email: "marcus.ianelli@example.com" } },
      ],
    },
  ],
};
