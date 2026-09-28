import { createStagingAdminClient } from "./adminClient";

/** Legacy demo routes still link to non-UUID mock slugs; treat those as not-found rather than querying the UUID column. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STUDENT_IDENTITY_SELECT =
  "id, full_name, email, phone, t_shirt_size, emergency_contact_name, emergency_contact_phone, has_required_info, stripe_customer_id, created_at";

type StudentRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  t_shirt_size: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  has_required_info: boolean | null;
  stripe_customer_id: string | null;
  created_at: string | null;
};

export type StagingStudent = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  tShirtSize: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  hasRequiredInfo: boolean;
  stripeCustomerId: string | null;
  createdAt: string | null;
};

async function emailsForStudentIds(
  supabase: ReturnType<typeof createStagingAdminClient>,
  ids: string[],
): Promise<Record<string, string>> {
  const emailMap: Record<string, string> = {};
  await Promise.all(
    ids.map(async (id) => {
      const { data } = await supabase.auth.admin.getUserById(id);
      if (data?.user?.email) {
        emailMap[id] = data.user.email;
      }
    }),
  );
  return emailMap;
}

function toStagingStudent(row: StudentRow, emailMap: Record<string, string>): StagingStudent {
  return {
    id: row.id,
    name: row.full_name || "Unknown Student",
    email: emailMap[row.id] ?? row.email ?? "",
    phone: row.phone,
    tShirtSize: row.t_shirt_size,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    hasRequiredInfo: row.has_required_info ?? false,
    stripeCustomerId: row.stripe_customer_id,
    createdAt: row.created_at,
  };
}

export async function listStudents(): Promise<StagingStudent[]> {
  const supabase = createStagingAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select(STUDENT_IDENTITY_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as StudentRow[];
  if (rows.length === 0) return [];

  const emailMap = await emailsForStudentIds(
    supabase,
    rows.map((row) => row.id),
  );
  return rows.map((row) => toStagingStudent(row, emailMap));
}

export async function getStudentById(id: string): Promise<StagingStudent | null> {
  if (!UUID_RE.test(id)) return null;

  const supabase = createStagingAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select(STUDENT_IDENTITY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;

  const row = data as StudentRow;
  const emailMap = await emailsForStudentIds(supabase, [row.id]);
  return toStagingStudent(row, emailMap);
}
