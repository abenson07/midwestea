export type StudentRow = {
  id: string;
  name: string;
  email: string;
  classes: string[];
  studentSince: string;
};

export const sampleStudents: StudentRow[] = [
  {
    id: "stu-1",
    name: "Caulin R Pendleton",
    email: "caulinpendleton@yahoo.com",
    classes: ["PARA-001"],
    studentSince: "Dec 28, 2025",
  },
  {
    id: "stu-2",
    name: "Nina Stevenson",
    email: "thegnarledneedle@gmail.com",
    classes: ["PARA-001"],
    studentSince: "Dec 30, 2025",
  },
  {
    id: "stu-3",
    name: "Michael Unruh",
    email: "michaelunruh@outlook.com",
    classes: ["PARA-001"],
    studentSince: "Jan 2, 2026",
  },
  {
    id: "stu-4",
    name: "Megan Royer",
    email: "meganroyer@hotmail.com",
    classes: ["PARA-001", "ATCC-001"],
    studentSince: "Jan 3, 2026",
  },
  {
    id: "stu-5",
    name: "Garrett Bull",
    email: "gbull2701@gmail.com",
    classes: ["PARA-001"],
    studentSince: "Jan 5, 2026",
  },
  {
    id: "stu-6",
    name: "Samuel Walker",
    email: "samuel.a.walker.03@gmail.com",
    classes: ["PARA-001"],
    studentSince: "Jan 6, 2026",
  },
  {
    id: "stu-7",
    name: "Max Pekay",
    email: "pekay0117@gmail.com",
    classes: ["PARA-001", "EMT-003"],
    studentSince: "Jan 8, 2026",
  },
  {
    id: "stu-8",
    name: "Ava Whitfield",
    email: "ava.whitfield@gmail.com",
    classes: ["PARA-002"],
    studentSince: "Feb 10, 2026",
  },
  {
    id: "stu-9",
    name: "Derek Simmons",
    email: "derek.simmons@yahoo.com",
    classes: ["PARA-002"],
    studentSince: "Feb 12, 2026",
  },
  {
    id: "stu-10",
    name: "Priya Chandran",
    email: "priya.chandran@gmail.com",
    classes: ["EMT-003"],
    studentSince: "Mar 3, 2026",
  },
  {
    id: "stu-11",
    name: "Jordan Blake",
    email: "jordan.blake@outlook.com",
    classes: ["EMT-003"],
    studentSince: "Mar 4, 2026",
  },
  {
    id: "stu-12",
    name: "Renee Castillo",
    email: "renee.castillo@gmail.com",
    classes: ["ATCC-001"],
    studentSince: "Apr 1, 2026",
  },
];
