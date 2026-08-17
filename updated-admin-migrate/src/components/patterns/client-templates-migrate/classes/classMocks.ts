export type ClassDetail = {
  id: string;
  title: string;
  type: string;
  instructor: string;
  description: string;
  date: string;
  time: string;
  location: string;
  publishStatus: "draft" | "published";
};

export type ClassRosterRow = {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Instructor";
  status: "Enrolled" | "Waitlisted";
};

export const CLASS_DETAILS: Record<string, ClassDetail> = {
  "open-class-a": {
    id: "open-class-a",
    title: "Open Class A",
    type: "BLS Certification",
    instructor: "Dana Whitfield",
    description:
      "Basic Life Support certification course — hands-on skills stations, written exam, and card issuance.",
    date: "Sep 8 – Oct 3, 2026",
    time: "6:00 PM – 9:00 PM",
    location: "Midwest EMS Training Center, Room 2",
    publishStatus: "published",
  },
  "open-class-b": {
    id: "open-class-b",
    title: "Open Class B",
    type: "ACLS Certification",
    instructor: "Marcus Cole",
    description:
      "Advanced Cardiac Life Support recertification — case-based scenarios and skills stations.",
    date: "Oct 13 – Nov 7, 2026",
    time: "6:00 PM – 9:00 PM",
    location: "Midwest EMS Training Center, Room 1",
    publishStatus: "draft",
  },
};

export const CLASS_ROSTERS: Record<string, ClassRosterRow[]> = {
  "open-class-a": [
    { id: "r1", name: "Priya Anand", email: "priya.anand@example.com", role: "Student", status: "Enrolled" },
    { id: "r2", name: "Lena Brandt", email: "lena.brandt@example.com", role: "Student", status: "Enrolled" },
    { id: "r3", name: "Owen Castillo", email: "owen.castillo@example.com", role: "Student", status: "Enrolled" },
    { id: "r4", name: "Dana Whitfield", email: "dana.whitfield@example.com", role: "Instructor", status: "Enrolled" },
    { id: "r5", name: "Sam Reyes", email: "sam.reyes@example.com", role: "Student", status: "Waitlisted" },
  ],
  "open-class-b": [
    { id: "r6", name: "Marcus Cole", email: "marcus.cole@example.com", role: "Instructor", status: "Enrolled" },
    { id: "r7", name: "Ines Novak", email: "ines.novak@example.com", role: "Student", status: "Enrolled" },
    { id: "r8", name: "Tariq Osei", email: "tariq.osei@example.com", role: "Student", status: "Waitlisted" },
  ],
};

export function classDetailFor(classId: string): ClassDetail {
  return (
    CLASS_DETAILS[classId] ?? {
      id: classId,
      title: "Class",
      type: "Class",
      instructor: "—",
      description: "",
      date: "—",
      time: "—",
      location: "—",
      publishStatus: "draft",
    }
  );
}

export function classRosterFor(classId: string): ClassRosterRow[] {
  return CLASS_ROSTERS[classId] ?? [];
}
