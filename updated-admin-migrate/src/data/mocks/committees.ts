import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import type { CommitteeInterests } from "@/types/database";

export type CommitteeCard = {
  id: string;
  name: string;
  chair: string;
  memberCount: number;
  cadence: string;
  description: string;
};

const REAL_COMMITTEES: CommitteeSlug[] = [
  "events",
  "outreach",
  "hub",
  "leaflet",
  "communications",
  "steering",
  "executive_board",
  "businesses",
];

const DESCRIPTIONS: Partial<Record<CommitteeSlug, string>> = {
  events: "Plans the Summer Social, holiday gathering, and other community-wide events.",
  outreach: "Builds relationships with neighboring households and welcomes new residents.",
  hub: "Coordinates emergency preparedness and neighborhood hub operations.",
  leaflet: "Produces and distributes the Maple Leaf Leaflet newsletter.",
  communications: "Owns FAQ content, stories, and social media presence.",
  steering: "Guides council priorities and cross-committee coordination.",
  executive_board: "Executive board meetings for council governance.",
  businesses: "Partners with neighborhood businesses and sponsorships.",
};

/** Live committee cards keyed by real CommitteeSlug (admin-migrate). */
export const sampleCommittees: CommitteeCard[] = REAL_COMMITTEES.map((id) => ({
  id,
  name: `${COMMITTEE_LABELS[id]} Committee`,
  chair: "—",
  memberCount: 0,
  cadence: "Monthly",
  description: DESCRIPTIONS[id] ?? `${COMMITTEE_LABELS[id]} committee.`,
}));

export type CommitteeDetail = CommitteeCard & {
  meetingDay: string;
  location: string;
  founded: string;
  websiteSlug?: string;
  publishStatus?: "draft" | "published";
};

export type CommitteeMemberTitle = "Chair" | "Member";

export type CommitteeMemberRow = {
  id: string;
  /** Linked people.id when known (live / picker). */
  personId?: string | null;
  name: string;
  /** Assigned title — only Chair or Member. Co-Chair is derived when 2+ Chairs. */
  role: CommitteeMemberTitle;
  email: string;
};

/** Display label: Co-Chair when more than one member is assigned Chair. */
export function displayMemberTitle(
  role: CommitteeMemberTitle,
  chairCount: number,
): "Chair" | "Co-Chair" | "Member" {
  if (role === "Chair" && chairCount > 1) return "Co-Chair";
  return role === "Chair" ? "Chair" : "Member";
}

export function countChairs(members: Array<{ role: CommitteeMemberTitle }>): number {
  return members.filter((m) => m.role === "Chair").length;
}

export type CommitteeMeetingRow = {
  id: string;
  date: string;
  topic: string;
  status: "Upcoming" | "Completed";
};

export const sampleCommitteeDetail: CommitteeDetail = {
  ...sampleCommittees[0],
  meetingDay: "First Tuesday, 7:00 PM",
  location: "Community Center, Room 2",
  founded: "2018",
  websiteSlug: "events",
  publishStatus: "published",
};

export const sampleCommitteeMembers: CommitteeMemberRow[] = [
  { id: "member-1", personId: "member-1", name: "Priya Anand", role: "Chair", email: "priya.anand@example.com" },
  {
    id: "member-2",
    personId: "member-2",
    name: "Marcus Ianelli",
    role: "Chair",
    email: "marcus.ianelli@example.com",
  },
  { id: "member-3", personId: "member-3", name: "Dana Whitfield", role: "Member", email: "dana.whitfield@example.com" },
  { id: "member-4", personId: "member-4", name: "Ines Okafor", role: "Member", email: "ines.okafor@example.com" },
  { id: "member-5", personId: "member-5", name: "Tom Reyes", role: "Member", email: "tom.reyes@example.com" },
];

/** ISO start for a demo meeting `days` from now (local evening). */
function demoMeetingStartsAt(daysFromNow: number, hour = 19): string {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

/**
 * One upcoming committee meeting per committee (within the next 30 days).
 * Shape matches `CommitteeMeetingListRow` for admin-migrate demo mode.
 */
export type SampleCommitteeMeetingListRow = {
  id: string;
  event_id: string;
  committee: CommitteeSlug;
  location_type: string;
  location: string | null;
  minutes_status: "draft";
  website_slug: string | null;
  created_at: string;
  updated_at: string;
  events: {
    id: string;
    name: string;
    starts_at: string;
    ends_at: string | null;
  };
};

const DEMO_MEETING_OFFSETS: Record<CommitteeSlug, number> = {
  events: 5,
  outreach: 9,
  hub: 12,
  leaflet: 16,
  communications: 19,
  steering: 22,
  executive_board: 26,
  businesses: 28,
};

export const sampleCommitteeMeetingsByCommittee = REAL_COMMITTEES.reduce(
  (acc, committee) => {
    const offset = DEMO_MEETING_OFFSETS[committee];
    const starts = demoMeetingStartsAt(offset);
    const endsDate = new Date(starts);
    endsDate.setHours(endsDate.getHours() + 1);
    const id = `demo-meeting-${committee}`;
    const eventId = `demo-event-${committee}`;
    const label = COMMITTEE_LABELS[committee];
    acc[committee] = [
      {
        id,
        event_id: eventId,
        committee,
        location_type: "in_person",
        location: "Community Center, Room 2",
        minutes_status: "draft",
        website_slug: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        events: {
          id: eventId,
          name: `${label} Committee meeting`,
          starts_at: starts,
          ends_at: endsDate.toISOString(),
        },
      },
    ];
    return acc;
  },
  {} as Record<CommitteeSlug, SampleCommitteeMeetingListRow[]>,
);

export function getSampleCommitteeMeetings(
  committee: CommitteeSlug,
): SampleCommitteeMeetingListRow[] {
  return sampleCommitteeMeetingsByCommittee[committee] ?? [];
}

/** Flat list for older templates that expect a single array. */
export const sampleCommitteeMeetings: CommitteeMeetingRow[] = REAL_COMMITTEES.map(
  (committee) => {
    const row = sampleCommitteeMeetingsByCommittee[committee][0];
    const starts = row.events.starts_at;
    const date = new Date(starts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return {
      id: row.id,
      date,
      topic: row.events.name,
      status: "Upcoming" as const,
    };
  },
);

export type CommitteeInitiativeTask = {
  id: string;
  title: string;
  assigneeName: string | null;
  assigneeId: string | null;
  dueAt: string | null;
  status: "open" | "done" | "canceled";
};

export type CommitteeInitiative = {
  id: string;
  committee: CommitteeSlug;
  title: string;
  description: string;
  tasks: CommitteeInitiativeTask[];
};

export const sampleInitiatives: CommitteeInitiative[] = [
  {
    id: "init-summer-social",
    committee: "events",
    title: "Summer Social 2026",
    description:
      "Plan and staff the annual Summer Social: venue, permits, food trucks, and volunteer coverage.",
    tasks: [
      {
        id: "init-task-1",
        title: "Confirm park reservation",
        assigneeName: "Priya Anand",
        assigneeId: "member-1",
        dueAt: "2026-05-15",
        status: "open",
      },
      {
        id: "init-task-2",
        title: "Recruit 12 day-of volunteers",
        assigneeName: null,
        assigneeId: null,
        dueAt: "2026-06-01",
        status: "open",
      },
    ],
  },
  {
    id: "init-welcome-kit",
    committee: "outreach",
    title: "New neighbor welcome kits",
    description: "Assemble and deliver welcome kits to households that joined the neighborhood this year.",
    tasks: [
      {
        id: "init-task-3",
        title: "Order print materials",
        assigneeName: "Dana Whitfield",
        assigneeId: "member-3",
        dueAt: "2026-04-20",
        status: "open",
      },
    ],
  },
  {
    id: "init-leaflet-sponsors",
    committee: "leaflet",
    title: "Expand leaflet sponsorship tiers",
    description: "Define two new mid-tier sponsorship packages and update the rate card.",
    tasks: [],
  },
];

const DEMO_INTEREST_NAMES = [
  ["Jordan Blake", "jordan.blake@example.com"],
  ["Sam Rivera", "sam.rivera@example.com"],
  ["Alex Chen", "alex.chen@example.com"],
  ["Riley Morgan", "riley.morgan@example.com"],
] as const;

/**
 * At least two pending website interests per committee for demo Overview members.
 */
export function getSamplePendingInterests(committee: CommitteeSlug): CommitteeInterests[] {
  const pair = [
    DEMO_INTEREST_NAMES[(REAL_COMMITTEES.indexOf(committee) * 2) % DEMO_INTEREST_NAMES.length],
    DEMO_INTEREST_NAMES[(REAL_COMMITTEES.indexOf(committee) * 2 + 1) % DEMO_INTEREST_NAMES.length],
  ];
  return pair.map(([name, contact], i) => ({
    id: `demo-interest-${committee}-${i + 1}`,
    name,
    contact,
    committee,
    source: i === 0 ? ("join-card" as const) : ("meeting-signup" as const),
    opportunity_title: i === 0 ? "Join the committee" : "Attend next meeting",
    volunteer_ask_id: null,
    event_id: null,
    status: "pending" as const,
    responded_at: null,
    responded_by: null,
    response_email_id: null,
    notes: null,
    created_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
  }));
}

export type SampleVolunteerAsk = {
  id: string;
  committee: CommitteeSlug;
  title: string;
  description: string;
  quantity: number;
};

const DEMO_ASK_TEMPLATES: Array<{ title: string; description: string; quantity: number }> = [
  {
    title: "Meeting note-taker",
    description: "Capture agenda notes and action items during the monthly meeting.",
    quantity: 1,
  },
  {
    title: "Outreach canvassers",
    description: "Door-knock a few blocks to invite neighbors to the next open house.",
    quantity: 4,
  },
  {
    title: "Setup crew",
    description: "Arrive early to set chairs, signage, and the sign-in table.",
    quantity: 3,
  },
];

export function getSampleVolunteerAsks(committee: CommitteeSlug): SampleVolunteerAsk[] {
  const idx = Math.max(0, REAL_COMMITTEES.indexOf(committee));
  const template = DEMO_ASK_TEMPLATES[idx % DEMO_ASK_TEMPLATES.length];
  return [
    {
      id: `demo-ask-${committee}-1`,
      committee,
      title: template.title,
      description: template.description,
      quantity: template.quantity,
    },
  ];
}
