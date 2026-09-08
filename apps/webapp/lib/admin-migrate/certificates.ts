import { createStagingAdminClient } from "./adminClient";
import { isUuid } from "./ids";

const CERTIFICATES_BUCKET = "certificates";
const SIGNED_URL_TTL_SECONDS = 300;

export type StagingCertificate = {
  id: string;
  studentId: string;
  enrollmentId: string;
  status: string;
  issuedAt: string | null;
  expiresAt: string | null;
  /** Short-lived signed URL for the "View PDF" link, null unless issued. */
  downloadUrl: string | null;
};

export type ListCertificatesOptions = {
  studentId?: string;
  classId?: string;
};

/** `classId` filters via a join through `enrollments`, since certificates aren't keyed by class directly. */
export async function listCertificates(
  options: ListCertificatesOptions = {},
): Promise<StagingCertificate[]> {
  const supabase = createStagingAdminClient();
  let query = supabase
    .from("certificates")
    .select(
      options.classId
        ? "id, student_id, enrollment_id, status, issued_at, expires_at, file_url, enrollments!inner(class_id)"
        : "id, student_id, enrollment_id, status, issued_at, expires_at, file_url",
    );

  if (options.studentId) {
    if (!isUuid(options.studentId)) return [];
    query = query.eq("student_id", options.studentId);
  }
  if (options.classId) {
    if (!isUuid(options.classId)) return [];
    query = query.eq("enrollments.class_id", options.classId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as any[];
  const issuedPaths = rows
    .filter((row) => row.status === "issued" && row.file_url)
    .map((row) => row.file_url as string);
  const signedUrlByPath = issuedPaths.length
    ? await signedUrlsFor(supabase, issuedPaths)
    : new Map<string, string>();

  return rows.map((row) => ({
    id: row.id as string,
    studentId: row.student_id as string,
    enrollmentId: row.enrollment_id as string,
    status: (row.status as string) ?? "pending",
    issuedAt: (row.issued_at as string | null) ?? null,
    expiresAt: (row.expires_at as string | null) ?? null,
    downloadUrl: row.file_url ? (signedUrlByPath.get(row.file_url as string) ?? null) : null,
  }));
}

async function signedUrlsFor(
  supabase: ReturnType<typeof createStagingAdminClient>,
  objectPaths: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  await Promise.all(
    objectPaths.map(async (path) => {
      const { data } = await supabase.storage
        .from(CERTIFICATES_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      if (data?.signedUrl) map.set(path, data.signedUrl);
    }),
  );
  return map;
}
