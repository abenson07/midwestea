export const STAFF_PERMISSIONS = [
  "Send invoices",
  "Refunds",
  "Cancel invoices",
  "Remove student from class",
  "Send and receive messages",
] as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  isTrainer: boolean;
  isAdmin: boolean;
  /** Only meaningful when `isAdmin` is true. */
  permissions: StaffPermission[];
  /** Class codes, only meaningful when `isTrainer` is true. */
  classes: string[];
  lastLoginAt: string;
  staffSince: string;
};

export const STAFF_CLASS_OPTIONS = ["PARA-001", "PARA-002", "EMT-003", "ATCC-001", "EMT-014"];

export const sampleStaff: StaffRow[] = [
  {
    id: "staff-1",
    name: "Kyle Brower",
    email: "kyle.brower@midwestea.org",
    phone: "(563) 555-0101",
    location: "Dubuque, IA",
    isTrainer: false,
    isAdmin: true,
    permissions: [
      "Send invoices",
      "Refunds",
      "Cancel invoices",
      "Remove student from class",
      "Send and receive messages",
    ],
    classes: [],
    lastLoginAt: "Jul 28, 2026",
    staffSince: "Jan 4, 2023",
  },
  {
    id: "staff-2",
    name: "Dana Wexler",
    email: "dana.wexler@midwestea.org",
    phone: "(563) 555-0102",
    location: "Cedar Rapids, IA",
    isTrainer: true,
    isAdmin: false,
    permissions: [],
    classes: ["PARA-001", "EMT-003"],
    lastLoginAt: "Jul 26, 2026",
    staffSince: "Mar 12, 2023",
  },
  {
    id: "staff-3",
    name: "Marcus Ohl",
    email: "marcus.ohl@midwestea.org",
    phone: "(563) 555-0103",
    location: "Davenport, IA",
    isTrainer: true,
    isAdmin: true,
    permissions: ["Send invoices", "Remove student from class"],
    classes: ["PARA-002"],
    lastLoginAt: "Jul 29, 2026",
    staffSince: "Sep 1, 2023",
  },
  {
    id: "staff-4",
    name: "Renata Cole",
    email: "renata.cole@midwestea.org",
    phone: "(563) 555-0104",
    location: "Waterloo, IA",
    isTrainer: true,
    isAdmin: false,
    permissions: [],
    classes: ["ATCC-001"],
    lastLoginAt: "Jul 20, 2026",
    staffSince: "Nov 18, 2023",
  },
  {
    id: "staff-5",
    name: "Priya Anand",
    email: "priya.anand@midwestea.org",
    phone: "(563) 555-0105",
    location: "Dubuque, IA",
    isTrainer: false,
    isAdmin: true,
    permissions: ["Refunds", "Cancel invoices"],
    classes: [],
    lastLoginAt: "Jul 27, 2026",
    staffSince: "Feb 2, 2024",
  },
  {
    id: "staff-6",
    name: "Tomas Reyes",
    email: "tomas.reyes@midwestea.org",
    phone: "(563) 555-0106",
    location: "Iowa City, IA",
    isTrainer: true,
    isAdmin: false,
    permissions: [],
    classes: ["EMT-014"],
    lastLoginAt: "Jul 14, 2026",
    staffSince: "May 30, 2024",
  },
  {
    id: "staff-7",
    name: "Holly Sargent",
    email: "holly.sargent@midwestea.org",
    phone: "(563) 555-0107",
    location: "Ames, IA",
    isTrainer: false,
    isAdmin: false,
    permissions: [],
    classes: [],
    lastLoginAt: "Jun 30, 2026",
    staffSince: "Aug 8, 2024",
  },
  {
    id: "staff-8",
    name: "Ben Farrow",
    email: "ben.farrow@midwestea.org",
    phone: "(563) 555-0108",
    location: "Dubuque, IA",
    isTrainer: true,
    isAdmin: true,
    permissions: ["Send invoices", "Refunds", "Send and receive messages"],
    classes: ["PARA-001", "ATCC-001"],
    lastLoginAt: "Jul 29, 2026",
    staffSince: "Jan 15, 2025",
  },
];

export type DirectoryPerson = {
  name: string;
  email: string;
};

/** People not currently on staff — search results for the "+ Add staff" typeahead. */
export const staffDirectory: DirectoryPerson[] = [
  { name: "Sofia Marchetti", email: "sofia.marchetti@gmail.com" },
  { name: "Owen Petrakis", email: "owen.petrakis@outlook.com" },
  { name: "Lena Voss", email: "lena.voss@yahoo.com" },
  { name: "Carter Higbee", email: "carter.higbee@gmail.com" },
  { name: "Ines Duarte", email: "ines.duarte@gmail.com" },
  { name: "Wyatt Solberg", email: "wyatt.solberg@hotmail.com" },
];
