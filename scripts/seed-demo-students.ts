/**
 * Seed the two demo personas onto a freshly-built demo Supabase project
 * (run scripts/generate-demo-sql.ts and its SQL files first).
 *
 * Creates exactly ONE synthetic student — "already enrolled, prerequisites
 * approved" — so the demo has a real "existing student" dashboard to show.
 * It deliberately does NOT create a second student: that persona is
 * "someone signing up," meant to be registered live, through the real
 * public checkout flow, during the demo itself.
 *
 * Also creates a single demo admin login (no real staff accounts are
 * copied — see docs/demo/generated-sql, `admins` is schema-only).
 *
 * Usage:
 *   npm run demo:seed-students -- --admin-email you+demoadmin@gmail.com --student-email you+demostudent@gmail.com [--class-code CLASS-CODE]
 *
 * Both emails default to Gmail "+" aliases of ADMIN_EMAIL / STUDENT_EMAIL
 * env vars if set, otherwise the script prompts you to pass --admin-email /
 * --student-email explicitly. Login on the demo project is OTP-only (no
 * passwords) — use real inboxes you control so the codes actually arrive.
 *
 * Writes only to the TARGET (MIGRATION_*) project. Never touches source.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseCredentials, getProjectRef } from './lib/migration-env';

function loadEnv() {
  const candidates = [
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../apps/webapp/.env.local'),
    path.resolve(__dirname, '../.env'),
  ];
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
  }
}

function arg(name: string): string | undefined {
  const flag = `--${name}`;
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function createAuthUser(supabase: SupabaseClient, email: string): Promise<string> {
  const { data: existing } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = existing?.users.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());
  if (found) {
    console.log(`  auth user already exists: ${email} (${found.id})`);
    return found.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`Failed to create auth user ${email}: ${error?.message}`);
  console.log(`  created auth user: ${email} (${data.user.id})`);
  return data.user.id;
}

const CLASS_COLUMNS = 'id, class_id, class_name, course_uuid, class_start_date';

/**
 * course_name is looked up separately (not via PostgREST relationship
 * embedding) — classes/courses predate migration tracking, so it's not
 * safe to assume a declared FK Postgres would auto-detect for embedding.
 */
async function withCourseName(supabase: SupabaseClient, classRow: any) {
  if (!classRow.course_uuid) return { ...classRow, course_name: null };
  const { data: course } = await supabase
    .from('courses')
    .select('course_name')
    .eq('id', classRow.course_uuid)
    .maybeSingle();
  return { ...classRow, course_name: course?.course_name ?? null };
}

async function pickDemoClass(supabase: SupabaseClient, classCode?: string) {
  if (classCode) {
    const { data, error } = await supabase.from('classes').select(CLASS_COLUMNS).eq('class_id', classCode).maybeSingle();
    if (error || !data) throw new Error(`--class-code ${classCode} not found: ${error?.message ?? 'no match'}`);
    return withCourseName(supabase, data);
  }

  // Prefer an upcoming class that already has a prerequisite snapshot, so
  // the demo also shows the prerequisite-approval story, not just billing.
  const { data: withPrereqs } = await supabase
    .from('class_prerequisites')
    .select('class_id')
    .limit(1);

  if (withPrereqs && withPrereqs.length > 0) {
    const { data } = await supabase.from('classes').select(CLASS_COLUMNS).eq('id', withPrereqs[0].class_id).maybeSingle();
    if (data) return withCourseName(supabase, data);
  }

  const { data: fallback, error: fallbackError } = await supabase
    .from('classes')
    .select(CLASS_COLUMNS)
    .order('class_start_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (fallbackError || !fallback) {
    throw new Error(`No classes found on the target project — did you run the generated SQL files first?`);
  }
  return withCourseName(supabase, fallback);
}

async function approvePrerequisites(
  supabase: SupabaseClient,
  studentId: string,
  classRowId: string,
  reviewerAdminId: string
) {
  const { data: reqs, error } = await supabase
    .from('class_prerequisites')
    .select('prerequisite_type_id, is_required, prerequisite_types(name, input_type, expiration_rule, expiration_duration_months)')
    .eq('class_id', classRowId);

  if (error) throw new Error(`Failed to load class_prerequisites: ${error.message}`);
  if (!reqs || reqs.length === 0) {
    console.log('  (no prerequisites configured on this class — skipping)');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  for (const req of reqs as any[]) {
    const type = req.prerequisite_types;
    const inputType = type?.input_type ?? 'checkbox';

    const value: Record<string, unknown> = {
      value_text: null,
      value_date: null,
      value_boolean: null,
      file_url: null,
    };
    if (inputType === 'file_upload') value.file_url = `demo-seed/${type?.name ?? 'credential'}.pdf`;
    else if (inputType === 'date') value.value_date = today;
    else if (inputType === 'checkbox') value.value_boolean = true;
    else value.value_text = 'Demo seed value';

    let expiresAt: string | null = null;
    if (type?.expiration_rule === 'duration_from_issue' && type?.expiration_duration_months) {
      const d = new Date();
      d.setMonth(d.getMonth() + type.expiration_duration_months);
      expiresAt = d.toISOString().slice(0, 10);
    }

    const { error: insertError } = await supabase.from('student_credentials').insert({
      student_id: studentId,
      prerequisite_type_id: req.prerequisite_type_id,
      submitted_for_class_id: classRowId,
      ...value,
      review_status: 'approved',
      reviewed_by: reviewerAdminId,
      reviewed_at: new Date().toISOString(),
      issued_at: today,
      expires_at: expiresAt,
    });
    if (insertError) throw new Error(`Failed to insert credential for ${type?.name}: ${insertError.message}`);
    console.log(`  approved prerequisite: ${type?.name ?? req.prerequisite_type_id}`);
  }
}

async function main() {
  loadEnv();

  const adminEmail = arg('admin-email') || process.env.DEMO_ADMIN_EMAIL;
  const studentEmail = arg('student-email') || process.env.DEMO_STUDENT_EMAIL;
  const classCode = arg('class-code');

  if (!adminEmail || !studentEmail) {
    console.error('Missing required emails. Usage:');
    console.error(
      '  npm run demo:seed-students -- --admin-email you+demoadmin@gmail.com --student-email you+demostudent@gmail.com [--class-code CODE]'
    );
    console.error('(Login is OTP-only — use real inboxes you control.)');
    process.exit(1);
  }

  const target = getSupabaseCredentials('target');
  console.log(`Seeding demo project: ${getProjectRef(target.url)}\n`);

  const supabase = createClient(target.url, target.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('1. Demo admin');
  const adminAuthId = await createAuthUser(supabase, adminEmail);
  const { error: adminUpsertError } = await supabase
    .from('admins')
    .upsert({ id: adminAuthId, email: adminEmail, display_name: 'Demo Admin' }, { onConflict: 'id' });
  if (adminUpsertError) throw new Error(`Failed to upsert admins row: ${adminUpsertError.message}`);
  console.log(`  admins row ready: ${adminEmail}\n`);

  console.log('2. Demo student (already enrolled)');
  const studentAuthId = await createAuthUser(supabase, studentEmail);
  const { error: studentUpsertError } = await supabase
    .from('students')
    .upsert({ id: studentAuthId, email: studentEmail, full_name: 'Demo Student' }, { onConflict: 'id' });
  if (studentUpsertError) throw new Error(`Failed to upsert students row: ${studentUpsertError.message}`);
  console.log(`  students row ready: ${studentEmail}\n`);

  console.log('3. Picking a class for the story');
  const classRow = await pickDemoClass(supabase, classCode);
  const courseName = classRow.course_name ?? classRow.class_name;
  console.log(`  using class: ${classRow.class_id ?? classRow.id} — ${courseName}\n`);

  console.log('4. Approving prerequisites for that class');
  await approvePrerequisites(supabase, studentAuthId, classRow.id, adminAuthId);
  console.log('');

  console.log('5. Enrolling the demo student');
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentAuthId)
    .eq('class_id', classRow.id)
    .maybeSingle();

  if (existingEnrollment) {
    console.log('  already enrolled — skipping insert.\n');
  } else {
    const { error: enrollError } = await supabase.from('enrollments').insert({
      student_id: studentAuthId,
      class_id: classRow.id,
      enrollment_status: 'registered',
      onboarding_complete: true,
    });
    if (enrollError) throw new Error(`Failed to enroll demo student: ${enrollError.message}`);
    console.log('  enrolled. A placeholder certificate row was auto-created (status: pending).\n');
  }

  console.log('✅ Demo seed complete.\n');
  console.log(`Admin login (OTP):   ${adminEmail}`);
  console.log(`Student login (OTP): ${studentEmail}`);
  console.log(`Story class:         ${courseName} (${classRow.class_id ?? classRow.id})\n`);
  console.log('Next:');
  console.log('  - Point apps/webapp/.env.local at this project and run the app.');
  console.log('  - Log into /admin as the demo admin, find this student\'s enrollment, and click');
  console.log('    "Generate certificate" live during the demo — that\'s a real, working feature now.');
  console.log('  - For the "signing up" story, register a second student live through the real');
  console.log('    checkout flow — nothing to seed for that one on purpose.');
}

main().catch((error: unknown) => {
  console.error(`\n❌ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
