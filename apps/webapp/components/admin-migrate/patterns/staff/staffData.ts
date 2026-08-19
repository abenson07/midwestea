import type { StaffRole, StaffRow } from "./types";

const INITIAL_STAFF: StaffRow[] = [
  {
    id: "staff-1",
    name: "Gabe Hajmohammad",
    email: "gabe.hajmohammad@example.com",
    roles: ["trainer", "admin"],
  },
  {
    id: "staff-2",
    name: "Kyle Brower",
    email: "kyle.brower@example.com",
    roles: ["trainer", "admin"],
  },
  {
    id: "staff-3",
    name: "Jonathan Reed",
    email: "jonathan.reed@example.com",
    roles: ["trainer"],
  },
  {
    id: "staff-4",
    name: "Jason Crawford",
    email: "jason.crawford@example.com",
    roles: ["trainer"],
  },
  {
    id: "staff-5",
    name: "Dana Whitfield",
    email: "dana.whitfield@example.com",
    roles: ["trainer"],
  },
  {
    id: "staff-6",
    name: "Marcus Cole",
    email: "marcus.cole@example.com",
    roles: ["trainer"],
  },
  {
    id: "staff-7",
    name: "Priya Anand",
    email: "priya.anand@example.com",
    roles: ["admin"],
  },
  {
    id: "staff-8",
    name: "Lena Brandt",
    email: "lena.brandt@example.com",
    roles: ["admin"],
  },
  {
    id: "staff-9",
    name: "Ines Okafor",
    email: "ines.okafor@example.com",
    roles: ["trainer", "admin"],
  },
];

/** Session-local roster so All / Trainers / Admin route remounts keep added people. */
let staffRows: StaffRow[] = INITIAL_STAFF.map((row) => ({ ...row, roles: [...row.roles] }));

export function getStaffRows(): StaffRow[] {
  return staffRows;
}

export function addStaffPerson(input: { name: string; email: string; roles: StaffRole[] }): StaffRow {
  const row: StaffRow = {
    id: `staff-${Date.now()}`,
    name: input.name,
    email: input.email,
    roles: [...input.roles],
  };
  staffRows = [row, ...staffRows];
  return row;
}

export function updateStaffPerson(next: StaffRow): StaffRow {
  const updated: StaffRow = { ...next, roles: [...next.roles] };
  staffRows = staffRows.map((row) => (row.id === updated.id ? updated : row));
  return updated;
}
