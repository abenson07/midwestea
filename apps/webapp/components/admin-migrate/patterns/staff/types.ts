export type StaffRole = "trainer" | "admin";

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  roles: StaffRole[];
};

export type StaffView = "trainers" | "admin";

export function hasTrainer(row: StaffRow): boolean {
  return row.roles.includes("trainer");
}

export function hasAdmin(row: StaffRow): boolean {
  return row.roles.includes("admin");
}

export function roleLabel(row: StaffRow): string {
  const trainer = hasTrainer(row);
  const admin = hasAdmin(row);
  if (trainer && admin) return "Both";
  if (trainer) return "Trainer";
  if (admin) return "Admin";
  return "—";
}

export function matchesStaffView(row: StaffRow, view: StaffView): boolean {
  if (view === "trainers") return hasTrainer(row);
  return hasAdmin(row);
}

export function addStaffLabel(view: StaffView): string {
  return view === "trainers" ? "Add Trainer" : "Add Admin";
}
