export type MembershipType = "household" | "individual" | "business-affiliate";

export type MemberRow = {
  id: string;
  name: string;
  email: string;
  membershipType: MembershipType;
  memberSince: string;
};

export type NeighborRow = {
  id: string;
  name: string;
  email: string;
  address: string;
  joinedDate: string;
};

export type VolunteerRow = {
  id: string;
  name: string;
  email: string;
  hasVolunteeredBefore: boolean;
  interestArea: string;
};

export const sampleMembers: MemberRow[] = [
  { id: "mem-1", name: "Caulin Pendleton", email: "caulinpendleton@yahoo.com", membershipType: "household", memberSince: "Jan 12, 2023" },
  { id: "mem-2", name: "Nina Stevenson", email: "thegnarledneedle@gmail.com", membershipType: "individual", memberSince: "Mar 4, 2024" },
  { id: "mem-3", name: "Michael Unruh", email: "michaelunruh@outlook.com", membershipType: "household", memberSince: "Feb 19, 2022" },
  { id: "mem-4", name: "Megan Royer", email: "meganroyer@hotmail.com", membershipType: "individual", memberSince: "Jun 30, 2025" },
  { id: "mem-5", name: "Garrett Bull", email: "garrettbull@gmail.com", membershipType: "business-affiliate", memberSince: "Oct 2, 2021" },
  { id: "mem-6", name: "Samuel Walker", email: "samuelwalker@yahoo.com", membershipType: "household", memberSince: "Sep 14, 2020" },
  { id: "mem-7", name: "Max Pekay", email: "maxpekay@outlook.com", membershipType: "business-affiliate", memberSince: "Apr 8, 2025" },
];

export const sampleNeighbors: NeighborRow[] = [
  { id: "ngh-1", name: "Ruth Calloway", email: "ruthcalloway@gmail.com", address: "412 Birchwood Ave, Dubuque, IA", joinedDate: "May 2, 2023" },
  { id: "ngh-2", name: "Owen Fitzgerald", email: "owenf@outlook.com", address: "89 Maple Leaf Ln, Dubuque, IA", joinedDate: "Nov 11, 2024" },
  { id: "ngh-3", name: "Delia Marsh", email: "deliamarsh@yahoo.com", address: "220 Cedar St, Dubuque, IA", joinedDate: "Jan 28, 2022" },
  { id: "ngh-4", name: "Theo Bramwell", email: "theobramwell@gmail.com", address: "56 Riverbend Dr, Dubuque, IA", joinedDate: "Jul 19, 2025" },
  { id: "ngh-5", name: "Ines Okafor", email: "inesokafor@outlook.com", address: "301 Willow Ct, Dubuque, IA", joinedDate: "Mar 3, 2024" },
];

export const sampleVolunteers: VolunteerRow[] = [
  { id: "vol-1", name: "Priya Anand", email: "priyaanand@gmail.com", hasVolunteeredBefore: true, interestArea: "Events" },
  { id: "vol-2", name: "Marcus Ianelli", email: "marcusianelli@yahoo.com", hasVolunteeredBefore: true, interestArea: "Leaflet Distribution" },
  { id: "vol-3", name: "Dana Whitfield", email: "danawhitfield@outlook.com", hasVolunteeredBefore: true, interestArea: "Finance" },
  { id: "vol-4", name: "Corey Lindqvist", email: "coreylindqvist@gmail.com", hasVolunteeredBefore: false, interestArea: "Events" },
  { id: "vol-5", name: "Aisha Boyer", email: "aishaboyer@yahoo.com", hasVolunteeredBefore: false, interestArea: "Communications" },
  { id: "vol-6", name: "Noah Pemberton", email: "noahpemberton@outlook.com", hasVolunteeredBefore: false, interestArea: "Neighbor Outreach" },
];
