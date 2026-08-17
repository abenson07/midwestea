export type ActionItemAssignee = {
  type: "committee" | "person";
  name: string;
};

export type ActionItem = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignee: ActionItemAssignee;
  linkedMeeting: string;
  status: "open" | "done" | "canceled";
};

export const sampleActionItems: ActionItem[] = [
  {
    id: "ai-1",
    title: "Confirm vendor list for Summer Social",
    description: "Reach out to the three vendors on the shortlist and lock in a headcount before deposits are due.",
    dueDate: "Aug 8, 2026",
    assignee: { type: "committee", name: "Events Committee" },
    linkedMeeting: "Board Meeting — Jul 14, 2026",
    status: "open",
  },
  {
    id: "ai-2",
    title: "Follow up with lapsed business members",
    description: "Send renewal reminders to the 6 business memberships that lapsed last quarter.",
    dueDate: "Aug 1, 2026",
    assignee: { type: "person", name: "Dana Whitfield" },
    linkedMeeting: "Finance Committee — Jul 9, 2026",
    status: "open",
  },
  {
    id: "ai-3",
    title: "Draft new volunteer onboarding packet",
    description: "Update the welcome packet to reflect the new background-check requirement.",
    dueDate: "Aug 15, 2026",
    assignee: { type: "committee", name: "Volunteer Committee" },
    linkedMeeting: "Board Meeting — Jul 14, 2026",
    status: "open",
  },
  {
    id: "ai-4",
    title: "Print updated leaflet routes map",
    description: "Route map needs the two new neighborhoods added before the next distribution cycle.",
    dueDate: "Jul 30, 2026",
    assignee: { type: "person", name: "Marcus Ianelli" },
    linkedMeeting: "Leaflet Ops — Jul 21, 2026",
    status: "open",
  },
  {
    id: "ai-5",
    title: "Schedule FAQ review with comms lead",
    description: "Walk through the outdated FAQ entries flagged during the last site audit.",
    dueDate: "Aug 5, 2026",
    assignee: { type: "person", name: "Priya Anand" },
    linkedMeeting: "Comms Sync — Jul 16, 2026",
    status: "open",
  },
  {
    id: "ai-6",
    title: "Approve Q3 newsletter content calendar",
    description: "Sign off on story topics for the next three newsletter sends.",
    dueDate: "Aug 12, 2026",
    assignee: { type: "committee", name: "Communications Committee" },
    linkedMeeting: "Board Meeting — Jul 14, 2026",
    status: "open",
  },
];
