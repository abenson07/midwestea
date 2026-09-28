import type { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export const CREDENTIAL_BUCKET = 'student-credentials';
export const CREDENTIAL_MAX_BYTES = 10 * 1024 * 1024;
export const CREDENTIAL_ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
] as const;

/** Uploads to `${studentId}/${prerequisiteTypeId}/${uuid}-${safeName}` and returns the object path. */
export async function uploadCredentialFile(
  supabase: SupabaseClient,
  studentId: string,
  prerequisiteTypeId: string,
  file: File
): Promise<{ objectPath: string | null; error: string | null }> {
  if (file.size > CREDENTIAL_MAX_BYTES) {
    return { objectPath: null, error: 'File must be 10MB or smaller.' };
  }

  if (!CREDENTIAL_ALLOWED_MIME.includes(file.type as (typeof CREDENTIAL_ALLOWED_MIME)[number])) {
    return { objectPath: null, error: 'Only PDF, JPEG, PNG, and HEIC files are accepted.' };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectPath = `${studentId}/${prerequisiteTypeId}/${randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from(CREDENTIAL_BUCKET).upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { objectPath: null, error: error.message };
  }

  return { objectPath, error: null };
}
