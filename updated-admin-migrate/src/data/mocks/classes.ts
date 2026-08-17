export type ProgramClassStatus = "enrolling" | "active" | "recently-closed";

export type ProgramClassRow = {
  id: string;
  code: string;
  name: string;
  status: ProgramClassStatus;
  enrolledCount: number;
  capacity: number;
  price: string;
  startDate: string;
  endDate: string;
};

export const sampleProgramClasses: ProgramClassRow[] = [
  {
    id: "para-001",
    code: "PARA-001",
    name: "Paramedic Program",
    status: "active",
    enrolledCount: 7,
    capacity: 25,
    price: "$8,800.00",
    startDate: "Jan 12, 2026",
    endDate: "Jan 12, 2027",
  },
  {
    id: "para-002",
    code: "PARA-002",
    name: "Paramedic Program",
    status: "enrolling",
    enrolledCount: 3,
    capacity: 25,
    price: "$8,800.00",
    startDate: "Aug 27, 2026",
    endDate: "Aug 27, 2027",
  },
  {
    id: "emt-003",
    code: "EMT-003",
    name: "Emergency Medical Technician",
    status: "active",
    enrolledCount: 12,
    capacity: 20,
    price: "$1,200.00",
    startDate: "Jun 1, 2026",
    endDate: "Sep 1, 2026",
  },
  {
    id: "atcc-001",
    code: "ATCC-001",
    name: "Advanced Tactical Casualty Care",
    status: "recently-closed",
    enrolledCount: 15,
    capacity: 15,
    price: "$650.00",
    startDate: "Apr 1, 2026",
    endDate: "Jul 5, 2026",
  },
];

export type OnlineClassRow = {
  id: string;
  code: string;
  name: string;
  price: string;
  duration: string;
  enrolledCount: number;
  isEnabled: boolean;
};

export const sampleOnlineClasses: OnlineClassRow[] = [
  {
    id: "cabs",
    code: "CABS",
    name: "Community Advanced Bystander Support",
    price: "$45.00",
    duration: "2 hrs",
    enrolledCount: 34,
    isEnabled: true,
  },
  {
    id: "acls",
    code: "ACLS",
    name: "Advanced Cardiovascular Life Support",
    price: "$225.00",
    duration: "1 day",
    enrolledCount: 19,
    isEnabled: true,
  },
  {
    id: "bls",
    code: "BLS",
    name: "Basic Life Support",
    price: "$65.00",
    duration: "4 hrs",
    enrolledCount: 61,
    isEnabled: true,
  },
  {
    id: "epi",
    code: "EPI",
    name: "Emergency Use of Epinephrine Auto-Injectors",
    price: "$25.00",
    duration: "1 hr",
    enrolledCount: 12,
    isEnabled: true,
  },
  {
    id: "oxy",
    code: "OXY",
    name: "Emergency Use of Medical Oxygen",
    price: "$35.00",
    duration: "1 hr",
    enrolledCount: 0,
    isEnabled: false,
  },
  {
    id: "pals",
    code: "PALS",
    name: "Pediatric Advanced Life Support",
    price: "$225.00",
    duration: "1 day",
    enrolledCount: 8,
    isEnabled: true,
  },
  {
    id: "peds",
    code: "PEDS",
    name: "Pediatric First Aid, CPR & AED",
    price: "$55.00",
    duration: "3 hrs",
    enrolledCount: 27,
    isEnabled: true,
  },
  {
    id: "path",
    code: "PATH",
    name: "Prehospital Trauma Life Support",
    price: "$275.00",
    duration: "2 days",
    enrolledCount: 0,
    isEnabled: false,
  },
  {
    id: "cpr",
    code: "CPR",
    name: "CPR & First Aid",
    price: "$55.00",
    duration: "3 hrs",
    enrolledCount: 45,
    isEnabled: true,
  },
];

export type OtherClassRow = {
  id: string;
  code: string;
  name: string;
  closedDate: string;
  totalEnrolled: number;
};

export const sampleOtherClasses: OtherClassRow[] = [
  {
    id: "bls-spring2025",
    code: "BLS-S25",
    name: "Basic Life Support — Spring 2025 cohort",
    closedDate: "May 1, 2025",
    totalEnrolled: 22,
  },
  {
    id: "emt-002",
    code: "EMT-002",
    name: "Emergency Medical Technician — Cohort 2",
    closedDate: "Dec 1, 2025",
    totalEnrolled: 18,
  },
];
