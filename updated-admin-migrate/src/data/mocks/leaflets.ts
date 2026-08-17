export type LeafletStatus = "planned" | "active" | "closed";

export type LeafletSummary = {
  id: string;
  title: string;
  distributionDate: string;
  status: LeafletStatus;
};

/** Mirrors the shape of `sampleEvents` — pulled from the leaflet schedule. */
export const sampleLeaflets: LeafletSummary[] = [
  { id: "lf-jun-2026", title: "June 2026 Leaflet", distributionDate: "2026-06-05", status: "closed" },
  { id: "lf-jul-2026", title: "July 2026 Leaflet", distributionDate: "2026-07-03", status: "closed" },
  { id: "lf-aug-2026", title: "August 2026 Leaflet", distributionDate: "2026-08-07", status: "active" },
  { id: "5ef07578-cc30-42c6-b44a-812005a9e245", title: "September 2026 Leaflet", distributionDate: "2026-09-04", status: "planned" },
  { id: "lf-oct-2026", title: "October 2026 Leaflet", distributionDate: "2026-10-02", status: "planned" },
  { id: "lf-nov-2026", title: "November 2026 Leaflet", distributionDate: "2026-11-06", status: "planned" },
];

export type LeafletDetail = {
  id: string;
  title: string;
  distributionDate: string;
  status: LeafletStatus;
  countdownLabel: string;
};

export const sampleLeafletDetail: LeafletDetail = {
  id: "lf-aug-2026",
  title: "August 2026 Leaflet",
  distributionDate: "2026-08-07",
  status: "active",
  countdownLabel: "Distributing today",
};

export type LeafletTaskGroupLabel =
  | "Past due"
  | "60 days out"
  | "30 days out"
  | "2 weeks out"
  | "Week of distribution"
  | "Day of distribution";

export const LEAFLET_TASK_GROUP_ORDER: LeafletTaskGroupLabel[] = [
  "Past due",
  "60 days out",
  "30 days out",
  "2 weeks out",
  "Week of distribution",
  "Day of distribution",
];

export const SAMPLE_LEAFLET_DATE_ISO = "2026-08-07";

export function leafletTaskGroupForOffset(
  daysBeforeDistribution: number,
): Exclude<LeafletTaskGroupLabel, "Past due"> {
  if (daysBeforeDistribution <= 0) return "Day of distribution";
  if (daysBeforeDistribution <= 7) return "Week of distribution";
  if (daysBeforeDistribution <= 14) return "2 weeks out";
  if (daysBeforeDistribution <= 30) return "30 days out";
  return "60 days out";
}

export function leafletTaskGroupForDueDate(
  dueDateIso: string,
  distributionDateIso: string = SAMPLE_LEAFLET_DATE_ISO,
): LeafletTaskGroupLabel {
  const due = new Date(`${dueDateIso}T00:00:00`);
  const distribution = new Date(`${distributionDateIso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) return "Past due";

  const daysBeforeDistribution = Math.round(
    (distribution.getTime() - due.getTime()) / 86_400_000,
  );
  return leafletTaskGroupForOffset(daysBeforeDistribution);
}

export function formatLeafletTaskDueLabel(dueDateIso: string, isOverdue: boolean): string {
  const due = new Date(`${dueDateIso}T00:00:00`);
  const dueStr = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return isOverdue ? `Due ${dueStr} — overdue` : `Due ${dueStr}`;
}

export type LeafletTaskRow = {
  id: string;
  title: string;
  group: LeafletTaskGroupLabel;
  dueLabel: string;
  isComplete: boolean;
  isOverdue: boolean;
};

export const sampleLeafletTasks: LeafletTaskRow[] = [
  {
    id: "lf-task-1",
    title: "Finalize article lineup",
    group: "30 days out",
    dueLabel: "Completed Jul 8",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "lf-task-2",
    title: "Send print files to printer",
    group: "2 weeks out",
    dueLabel: "Completed Jul 24",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "lf-task-3",
    title: "Confirm sponsor ad placements",
    group: "2 weeks out",
    dueLabel: "Completed Jul 25",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "lf-task-4",
    title: "Assign remaining open routes",
    group: "Past due",
    dueLabel: "Due Aug 3 — overdue",
    isComplete: false,
    isOverdue: true,
  },
  {
    id: "lf-task-5",
    title: "Pick up leaflets from printer",
    group: "Week of distribution",
    dueLabel: "Due Aug 6",
    isComplete: false,
    isOverdue: false,
  },
  {
    id: "lf-task-6",
    title: "Text deliverers distribution reminder",
    group: "Day of distribution",
    dueLabel: "Due Aug 7",
    isComplete: false,
    isOverdue: false,
  },
];

/**
 * Route status: `unassigned` (open, no deliverer), `in-progress` (covered,
 * has a deliverer), or `skipped` (a deliverer dropped it — needs a
 * substitute). `sampleAllRouteRows()` in adapters.ts builds the `in-progress`
 * rows directly from `sampleDeliverers`.
 */
export type LeafletRouteStatus = "unassigned" | "in-progress" | "skipped";

export type LeafletRouteRow = {
  id: string;
  name: string;
  initials: string;
  detail: string;
  status: LeafletRouteStatus;
};

/** Routes with no primary deliverer assigned — pulled from `routes` where `primary_deliverer_id is null`. */
export const sampleOpenRoutes: LeafletRouteRow[] = [
  { id: "2a4257a9-9fbd-4845-91e5-db35888df2fb", name: "Cloud City Coffee", initials: "—", detail: "50 addresses", status: "unassigned" },
  { id: "77b321b4-ba1a-499c-b319-207adccd22e1", name: "20th: 88th to 92nd", initials: "—", detail: "45 addresses", status: "unassigned" },
  { id: "36992fdf-f1c0-4ece-98e4-0c599c252aa8", name: "Hive Apartments", initials: "—", detail: "45 addresses", status: "unassigned" },
  { id: "8d5f5b9b-8d12-499b-8a01-5def7a9821cd", name: "5th: 78th to 81th", initials: "—", detail: "40 addresses", status: "unassigned" },
  { id: "6f2e6e64-2591-4bc8-8337-f2877014dc24", name: "Cambridge Court Condos", initials: "—", detail: "40 addresses", status: "unassigned" },
];

/** Routes a deliverer dropped that need a substitute — none reported yet. */
export const sampleSkippedRoutes: LeafletRouteRow[] = [];

export type LeafletDelivererRouteRow = {
  id: string;
  name: string;
  leafletCount: number;
  routeType?: string | null;
  /** Delivery row id when known (live); demo reuses route id. */
  deliveryId?: string;
  routeId?: string;
  isSkipped?: boolean;
};

export type LeafletDelivererRow = {
  id: string;
  name: string;
  email: string;
  address: string;
  status: "Confirmed" | "Invited" | "Declined";
  routes: LeafletDelivererRouteRow[];
};

/** Pulled from `routes` joined to `people` via `primary_deliverer_id` — the 15 highest-volume assigned routes. */
export const sampleDeliverers: LeafletDelivererRow[] = [
  {
    id: "4898daa4-b535-4279-af56-eccfbb3da3b1",
    name: "Holly Reichmann",
    email: "holly.reichmann@example.com",
    address: "7502 9th Ave NE",
    status: "Confirmed",
    routes: [{ id: "7fc06b91-a199-4761-94dc-d00ebe650977", name: "1st: 85th to 92nd", leafletCount: 80, routeType: "Street", deliveryId: "7fc06b91-a199-4761-94dc-d00ebe650977", routeId: "7fc06b91-a199-4761-94dc-d00ebe650977" }],
  },
  {
    id: "a9f39a4d-e4f5-4bc8-848e-c9d20e366dc4",
    name: "Chris Ultican",
    email: "chris.ultican@example.com",
    address: "Address not on file",
    status: "Confirmed",
    routes: [{ id: "e58645f9-5355-42de-b67d-e4ded53ffff9", name: "Roosevelt: 92nd to 102nd", leafletCount: 69, routeType: "Street", deliveryId: "e58645f9-5355-42de-b67d-e4ded53ffff9", routeId: "e58645f9-5355-42de-b67d-e4ded53ffff9" }],
  },
  {
    id: "3f9e62d5-0841-4855-96f8-4d9f078b962f",
    name: "Cara Mattera",
    email: "cara.mattera@example.com",
    address: "1241 NE 104th St",
    status: "Confirmed",
    routes: [{ id: "330701ea-a47e-46ae-801c-6527774d8ff0", name: "105th: 5th to 11th (inc 2 alleys)", leafletCount: 63, routeType: "Street", deliveryId: "330701ea-a47e-46ae-801c-6527774d8ff0", routeId: "330701ea-a47e-46ae-801c-6527774d8ff0" }],
  },
  {
    id: "385dc4c9-bc42-4a94-ab5e-308c18043478",
    name: "Billy Thompson",
    email: "billy.thompson@example.com",
    address: "508 NE 84th St",
    status: "Confirmed",
    routes: [
      { id: "003e52f5-9bf3-4ae4-8c12-df7d90cfaddd", name: "83rd: 5th to Roosevelt", leafletCount: 58, routeType: "Street", deliveryId: "003e52f5-9bf3-4ae4-8c12-df7d90cfaddd", routeId: "003e52f5-9bf3-4ae4-8c12-df7d90cfaddd" },
      { id: "418e3e75-d917-4a81-83ac-78115b93b393", name: "84th: 5th to Roosevelt", leafletCount: 55, routeType: "Street", deliveryId: "418e3e75-d917-4a81-83ac-78115b93b393", routeId: "418e3e75-d917-4a81-83ac-78115b93b393" },
    ],
  },
  {
    id: "3a0db482-8df2-46dc-a7e4-44590b90847f",
    name: "Barb And Mark",
    email: "barb.and.mark@example.com",
    address: "1234 NE 98th Street",
    status: "Confirmed",
    routes: [{ id: "b966accd-ae73-4d7c-9ef4-297b2c68296d", name: "100th: 12th to Ravine", leafletCount: 54, routeType: "Street", deliveryId: "b966accd-ae73-4d7c-9ef4-297b2c68296d", routeId: "b966accd-ae73-4d7c-9ef4-297b2c68296d" }],
  },
  {
    id: "9c8df363-fb11-46b9-8f4d-e71e5a9dece5",
    name: "Joan Goodman",
    email: "joan.goodman@example.com",
    address: "820 NE 91st St",
    status: "Confirmed",
    routes: [
      { id: "d4c3277a-881a-4559-8f83-6523b60ade88", name: "91st: 5th to Roosevelt", leafletCount: 54, routeType: "Street", deliveryId: "d4c3277a-881a-4559-8f83-6523b60ade88", routeId: "d4c3277a-881a-4559-8f83-6523b60ade88" },
      { id: "c79bdfb0-4868-4f5c-a362-b61ed8c2f399", name: "91st: 1st to 5th", leafletCount: 51, routeType: "Street", deliveryId: "c79bdfb0-4868-4f5c-a362-b61ed8c2f399", routeId: "c79bdfb0-4868-4f5c-a362-b61ed8c2f399" },
    ],
  },
  {
    id: "2b8c9419-63da-4314-8173-206b5d50cf8a",
    name: "Molly Moore",
    email: "molly.moore@example.com",
    address: "840 NE 91st Street",
    status: "Confirmed",
    routes: [{ id: "d7330cb8-0ca7-44db-a503-d388deed2958", name: "89th: 5th to Roosevelt", leafletCount: 52, routeType: "Street", deliveryId: "d7330cb8-0ca7-44db-a503-d388deed2958", routeId: "d7330cb8-0ca7-44db-a503-d388deed2958" }],
  },
  {
    id: "fa24865d-c8bd-4fc1-9dd4-a0f60430ec1a",
    name: "Michael Kinneman",
    email: "michael.kinneman@example.com",
    address: "Address not on file",
    status: "Confirmed",
    routes: [{ id: "c5bbf716-b15f-4ec9-85cb-e11d5613b705", name: "2nd: 82nd to 89th", leafletCount: 51, routeType: "Street", deliveryId: "c5bbf716-b15f-4ec9-85cb-e11d5613b705", routeId: "c5bbf716-b15f-4ec9-85cb-e11d5613b705" }],
  },
  {
    id: "4aec410f-ff59-4227-b334-0848bdcd003c",
    name: "Diane Britt",
    email: "diane.britt@example.com",
    address: "9109 12th Ave NE",
    status: "Confirmed",
    routes: [{ id: "1c73cb8a-d1c4-452e-8a8a-09ebe2dcd022", name: "8th: 89th to 95th", leafletCount: 51, routeType: "Street", deliveryId: "1c73cb8a-d1c4-452e-8a8a-09ebe2dcd022", routeId: "1c73cb8a-d1c4-452e-8a8a-09ebe2dcd022" }],
  },
  {
    id: "7bea0c12-8fb8-41dc-b4ee-c928f91ed7bb",
    name: "Theresa M Jurotich",
    email: "theresa.m.jurotich@example.com",
    address: "Address not on file",
    status: "Confirmed",
    routes: [{ id: "5c0edd20-2652-4f11-87fc-68f9a3e55fea", name: "102nd: Roosevelt to 15th", leafletCount: 50, routeType: "Street", deliveryId: "5c0edd20-2652-4f11-87fc-68f9a3e55fea", routeId: "5c0edd20-2652-4f11-87fc-68f9a3e55fea" }],
  },
  {
    id: "2aa372e1-2c2f-4ed0-931e-a1e439763cef",
    name: "Rebecca Letwin",
    email: "rebecca.letwin@example.com",
    address: "8254 4th Ave NE",
    status: "Confirmed",
    routes: [{ id: "ed1ef53d-5fca-46b7-aa96-a21f2a9df63c", name: "81st: 5th to Roosevelt", leafletCount: 50, routeType: "Street", deliveryId: "ed1ef53d-5fca-46b7-aa96-a21f2a9df63c", routeId: "ed1ef53d-5fca-46b7-aa96-a21f2a9df63c" }],
  },
  {
    id: "b37c07b0-3ff6-4baa-9b65-4e2a7d9c481b",
    name: "Kione Wong",
    email: "kione.wong@example.com",
    address: "543 NE 84th St",
    status: "Confirmed",
    routes: [{ id: "1905c802-1566-491f-8bce-2236873fe958", name: "85th: 5th to Roosevelt", leafletCount: 50, routeType: "Street", deliveryId: "1905c802-1566-491f-8bce-2236873fe958", routeId: "1905c802-1566-491f-8bce-2236873fe958" }],
  },
  {
    id: "d576b604-e63b-4894-b1bd-f7b836889362",
    name: "Diane Knutson",
    email: "diane.knutson@example.com",
    address: "Address not on file",
    status: "Confirmed",
    routes: [{ id: "610a5b95-419e-45bb-96b7-2d97165731a0", name: "86th: 5th to Roosevelt", leafletCount: 50, routeType: "Street", deliveryId: "610a5b95-419e-45bb-96b7-2d97165731a0", routeId: "610a5b95-419e-45bb-96b7-2d97165731a0" }],
  },
];

export type LeafletBudgetSummary = {
  totalBudget: number;
  received: number;
  pending: number;
};

/** Derived from `sampleLeafletSponsorshipInvoices`: Paid → received, Pending + Overdue → pending. */
export const sampleLeafletBudgetSummary: LeafletBudgetSummary = {
  totalBudget: 3200,
  received: 1650,
  pending: 700,
};

export type LeafletSponsorshipInvoiceRow = {
  id: string;
  invoiceNumber: string;
  business: string;
  level: string;
  amount: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
};

export const sampleLeafletSponsorshipInvoices: LeafletSponsorshipInvoiceRow[] = [
  { id: "lf-inv-1", invoiceNumber: "INV-4001", business: "Third Place Books", level: "Full Page", amount: "$650.00", dueDate: "Jul 15, 2026", status: "Paid" },
  { id: "lf-inv-2", invoiceNumber: "INV-4002", business: "Watershed Pub", level: "Half Page", amount: "$400.00", dueDate: "Jul 18, 2026", status: "Paid" },
  { id: "lf-inv-3", invoiceNumber: "INV-4003", business: "Maple Leaf Grocery", level: "Half Page", amount: "$400.00", dueDate: "Jul 20, 2026", status: "Paid" },
  { id: "lf-inv-4", invoiceNumber: "INV-4004", business: "Elemental Pizza", level: "Quarter Page", amount: "$200.00", dueDate: "Aug 5, 2026", status: "Pending" },
  { id: "lf-inv-5", invoiceNumber: "INV-4005", business: "Byrek Bakery", level: "Quarter Page", amount: "$200.00", dueDate: "Aug 5, 2026", status: "Pending" },
  { id: "lf-inv-6", invoiceNumber: "INV-4006", business: "Corliss Coffee", level: "Business Card", amount: "$100.00", dueDate: "Jul 25, 2026", status: "Overdue" },
];

export type LeafletSponsorRow = {
  id: string;
  name: string;
  tier: string;
  status: "Confirmed" | "Pending" | "Declined";
};

export const sampleLeafletSponsors: LeafletSponsorRow[] = [
  { id: "lf-spon-1", name: "Third Place Books", tier: "Full Page", status: "Confirmed" },
  { id: "lf-spon-2", name: "Watershed Pub", tier: "Half Page", status: "Confirmed" },
  { id: "lf-spon-3", name: "Maple Leaf Grocery", tier: "Half Page", status: "Confirmed" },
  { id: "lf-spon-4", name: "Elemental Pizza", tier: "Quarter Page", status: "Pending" },
  { id: "lf-spon-5", name: "Corliss Coffee", tier: "Business Card", status: "Declined" },
];

export type LeafletSponsorshipLevel = {
  id: string;
  name: string;
  price: string;
  quantityAvailable: number;
  quantityFilled: number;
};

export const sampleLeafletSponsorshipLevels: LeafletSponsorshipLevel[] = [
  { id: "lf-level-full", name: "Full Page", price: "$650", quantityAvailable: 2, quantityFilled: 1 },
  { id: "lf-level-half", name: "Half Page", price: "$400", quantityAvailable: 4, quantityFilled: 2 },
  { id: "lf-level-quarter", name: "Quarter Page", price: "$200", quantityAvailable: 6, quantityFilled: 2 },
  { id: "lf-level-card", name: "Business Card", price: "$100", quantityAvailable: 10, quantityFilled: 1 },
];

export type LeafletStoryStatus = "Draft" | "In review" | "Scheduled" | "Published";

export type LeafletStoryRow = {
  id: string;
  title: string;
  author: string;
  type: string;
  date: string;
  time: string;
  status: LeafletStoryStatus;
};

/** Modeled on the `stories` list in the live leaflet overview (`lf-story-row`). */
export const sampleLeafletStories: LeafletStoryRow[] = [
  { id: "story-1", title: "Meet the new Community Council reps", author: "Priya Anand", type: "Feature", date: "Aug 1", time: "9:00 AM", status: "Published" },
  { id: "story-2", title: "Maple Leaf Reservoir Park cleanup recap", author: "Marcus Ianelli", type: "Update", date: "Aug 3", time: "11:30 AM", status: "In review" },
  { id: "story-3", title: "Local business spotlight: Corliss Coffee", author: "Dana Whitfield", type: "Spotlight", date: "Aug 5", time: "2:00 PM", status: "Draft" },
  { id: "story-4", title: "September events preview", author: "Sam Okafor", type: "Events", date: "Aug 6", time: "4:15 PM", status: "Scheduled" },
];

export type LeafletQrCode = {
  id: string;
  label: string;
  subtitle?: string;
  url: string;
};

/** Modeled on `QrCodesWidget` — Membership + Leaflet Routes QR codes. */
export const sampleLeafletQrCodes: LeafletQrCode[] = [
  {
    id: "qr-membership",
    label: "Membership QR Code",
    subtitle: "Place in leaflet",
    url: "https://mapleleafcommunity.org/join",
  },
  {
    id: "qr-open-routes",
    label: "Leaflet Routes QR Code",
    url: "https://mapleleafcommunity.org/open-routes",
  },
];

export type LeafletListView = "members" | "events";

export type LeafletListEventItem = {
  id: string;
  title: string;
  date: string;
};

/** Modeled on `ListsForLeafletWidget` — Business List + Upcoming Events segments. */
export const sampleLeafletBusinessList: string[] = [
  "Third Place Books",
  "Watershed Pub",
  "Maple Leaf Grocery",
  "Elemental Pizza",
  "Byrek Bakery",
  "Corliss Coffee",
  "Maple Leaf Grill",
  "Zoka Coffee",
  "Alfa Pizzeria",
];

export const sampleLeafletUpcomingEvents: LeafletListEventItem[] = [
  { id: "evt-movies-tower", title: "Movie by the Tower", date: "2026-08-08" },
  { id: "evt-summer-social", title: "Summer Social", date: "2026-08-15" },
  { id: "evt-book-club", title: "Book Club", date: "2026-09-20" },
  { id: "evt-community-meeting", title: "Community Meeting", date: "2026-10-14" },
];
