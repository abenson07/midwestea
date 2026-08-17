export type AuditLogRow = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
};

export const AUDIT_LOG_ROWS: AuditLogRow[] = [
  {
    id: "log-1",
    at: "2026-08-17T13:42:00.000Z",
    actor: "Kyle Brower",
    action: "Updated class settings",
    target: "PARA-004",
  },
  {
    id: "log-2",
    at: "2026-08-17T11:18:00.000Z",
    actor: "Gabe Hajmohammad",
    action: "Enrolled student",
    target: "Maya Ellison → EMT-003",
  },
  {
    id: "log-3",
    at: "2026-08-16T19:05:00.000Z",
    actor: "Priya Anand",
    action: "Saved program template",
    target: "Paramedic Program",
  },
  {
    id: "log-4",
    at: "2026-08-16T16:22:00.000Z",
    actor: "Dana Whitfield",
    action: "Marked invoice paid",
    target: "Invoice 110",
  },
  {
    id: "log-5",
    at: "2026-08-15T14:01:00.000Z",
    actor: "Kyle Brower",
    action: "Added location",
    target: "Midwest EMS Training Center",
  },
  {
    id: "log-6",
    at: "2026-08-14T09:40:00.000Z",
    actor: "Lena Brandt",
    action: "Archived prerequisite",
    target: "High school graduation",
  },
  {
    id: "log-7",
    at: "2026-08-12T18:12:00.000Z",
    actor: "Gabe Hajmohammad",
    action: "Created class",
    target: "BLS-001",
  },
  {
    id: "log-8",
    at: "2026-08-10T12:00:00.000Z",
    actor: "Dana Whitfield",
    action: "Published class",
    target: "PARA-004",
  },
];
