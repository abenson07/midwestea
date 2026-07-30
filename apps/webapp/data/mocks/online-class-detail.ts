export type OnlineClassSummary = {
  name: string;
  program: string;
  courseCode: string;
  isOnline: boolean;
  status: "enrolling" | "in-progress" | "closed";
  enrollmentStartDate: string;
  enrollmentCloseDate: string;
  price: string;
  registrationFee: string;
  registrationLimit: number;
  enrolledCount: number;
  capacity: number;
};

export const sampleOnlineClassSummary: OnlineClassSummary = {
  name: "ACLS-014",
  program: "Advanced Cardiac Life Support",
  courseCode: "ACLS",
  isOnline: true,
  status: "enrolling",
  enrollmentStartDate: "Dec 15, 2025",
  enrollmentCloseDate: "Feb 1, 2026",
  price: "$225.00",
  registrationFee: "$0.00",
  registrationLimit: 60,
  enrolledCount: 38,
  capacity: 60,
};

export type OnlineClassStudentRow = {
  id: string;
  name: string;
  status: "Enrolled" | "Waitlisted" | "Withdrawn";
  level: string;
  email: string;
  enrolledAt: string;
};

export const sampleOnlineClassStudents: OnlineClassStudentRow[] = [
  {
    id: "ostu-1",
    name: "Priya Anand",
    status: "Enrolled",
    level: "RN",
    email: "priya.anand@gmail.com",
    enrolledAt: "Jan 22, 2026",
  },
  {
    id: "ostu-2",
    name: "Deacon Holt",
    status: "Enrolled",
    level: "EMT-B",
    email: "deacon.holt@outlook.com",
    enrolledAt: "Jan 20, 2026",
  },
  {
    id: "ostu-3",
    name: "Marisol Vega",
    status: "Enrolled",
    level: "RN",
    email: "marisol.vega@yahoo.com",
    enrolledAt: "Jan 19, 2026",
  },
  {
    id: "ostu-4",
    name: "Owen Fitzgerald",
    status: "Waitlisted",
    level: "EMT-P",
    email: "owen.fitzgerald@gmail.com",
    enrolledAt: "Jan 17, 2026",
  },
  {
    id: "ostu-5",
    name: "Talia Brennan",
    status: "Enrolled",
    level: "RN",
    email: "talia.brennan@hotmail.com",
    enrolledAt: "Jan 14, 2026",
  },
  {
    id: "ostu-6",
    name: "Cyrus Nakamura",
    status: "Enrolled",
    level: "EMT-I",
    email: "cyrus.nakamura@gmail.com",
    enrolledAt: "Jan 12, 2026",
  },
  {
    id: "ostu-7",
    name: "Bridget Sawyer",
    status: "Withdrawn",
    level: "RN",
    email: "bridget.sawyer@gmail.com",
    enrolledAt: "Jan 9, 2026",
  },
  {
    id: "ostu-8",
    name: "Elias Whitfield",
    status: "Enrolled",
    level: "EMT-B",
    email: "elias.whitfield@icloud.com",
    enrolledAt: "Jan 8, 2026",
  },
];
