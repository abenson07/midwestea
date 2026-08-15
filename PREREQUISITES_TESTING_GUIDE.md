# Class Prerequisites — End-to-End Testing Guide

Covers the five-L1 prerequisite stack: [BEN-687](https://linear.app/midwestern/issue/BEN-687/manage-prerequisite-catalog-and-template-assignment), [BEN-683](https://linear.app/midwestern/issue/BEN-683/store-class-prerequisites-and-student-credential-records), [BEN-686](https://linear.app/midwestern/issue/BEN-686/collect-class-prerequisites-after-payment-and-from-the-student-profile), [BEN-684](https://linear.app/midwestern/issue/BEN-684/review-student-credentials-and-handle-re-submission), [BEN-685](https://linear.app/midwestern/issue/BEN-685/surface-prerequisite-status-access-gating-and-communications).

**Every section below is self-contained.** Each one restates its own branch, migrations, seed data, test email, and verification SQL. Nothing references "the student from the previous section" or "the ID you saved earlier" — every query looks its subject up by a stable identifier (an email address, a class code, a prerequisite name). Sections can be split into individual Linear issues and run in any order, or by different people on different days.

All seed SQL is **idempotent** — safe to run repeatedly, safe to run in multiple sections.

**Test email base address:** every section uses a `+tag` alias of `alexbensonux@gmail.com`. If your base address is different, swap it consistently everywhere in the section you're running.

---

## 1. Harness — what you actually need

| Component | Needed for | Notes |
|---|---|---|
| Supabase sandbox project | All sections | Not your production project. Prerequisites add 5 tables, 1 view, 1 function, 1 storage bucket. |
| Stripe test mode + `stripe listen` | §7 (BEN-686) only | The post-payment handoff into prerequisites is part of that test. Other sections seed enrollments directly in SQL. |
| Working OTP email delivery | §7, §8, §9 | Admin and student sign-in are passwordless. Also needed to read the prerequisite emails in §9. |
| Migrations 24–30 applied in order | All sections | See §3. |
| Supabase Storage enabled | §6, §8 | Migration 28 creates a private `student-credentials` bucket for file-upload prerequisites. |

You do **not** need bespoke scripts to move a student through states. Everything is exercised through the app in two roles — **admin** (configure catalog, assign to templates, create classes, review submissions, inspect staff views) and **student** (register/pay, submit prerequisites, return via profile) — plus SQL to verify and to set up starting conditions.

The one genuine command-line check in the whole pass is in §10:

```bash
cd apps/webapp && npm run verify:separation
```

---

## 2. Branches

Each L1 lives on its own branch, stacked so each contains everything before it. Check out the branch for the section you're testing:

| Section | L1 | Branch | Migrations that must be applied |
|---|---|---|---|
| §5 | BEN-687 | `687-tiered-enrollment` | 24, 25, 26, 27 |
| §6 | BEN-683 | `683-tiered-enrollment` | 24–29 |
| §7 | BEN-686 | `686-tiered-enrollment` | 24–29 |
| §8 | BEN-684 | `684-tiered-enrollment` | 24–30 |
| §9, §10, §11 | BEN-685 | `685-tiered-enrollment` | 24–30 |

Because the branches are stacked, `685-tiered-enrollment` contains all five L1s — you can run every section from that one branch if you'd rather not switch. Use the per-L1 branches when you want to confirm an L1 works **without** later work masking a gap.

### Testing one branch at a time, merging as you go

The intended workflow: check out `687-tiered-enrollment` → test §5 → merge into your integration branch → check out `683-tiered-enrollment` → test §6 → merge → and so on. Each stacked branch already contains the ones before it, so those merges are fast-forwards with no conflicts.

> **One hazard.** If testing turns up a bug and you fix it *on the integration branch* after merging, that fix will **not** exist on `683`/`686`/`684`/`685`, which were branched earlier. Either fix it on the earliest stacked branch that contains the file and re-merge forward, or cherry-pick it onto each remaining branch before you test it. Fixing only on the integration branch means the next branch you check out silently reintroduces the bug.

### The test student journey — one student, carried across sections

**Primary student: `alexbensonux+preqjourney@gmail.com`.** The same person moves through the whole lifecycle, exactly as a real student would. This is deliberate — credential portability is the point of the data model, and it only shows up honestly when one person accumulates credentials across classes.

| After you finish | Journey student's state |
|---|---|
| §6 (BEN-683, branch `683`) | Exists (seeded via SQL — there's no student prerequisite UI on this branch yet). Enrolled in `PREQ-683`. Holds **one approved, unexpired `Test BLS Card`**. |
| §7 (BEN-686, branch `686`) | Registers and pays through Stripe for `PREQ-686`. **The wizard shows 3 steps, not 4** — the BLS card from §6 is already satisfied. Ends with pending submissions. |
| §8 (BEN-684, branch `684`) | One submission rejected, resubmitted, then approved. Rejected row preserved as `superseded`. Ends fully approved. |
| §9 (BEN-685, branch `685`) | Fully approved → class materials unlock, fully-enrolled email sends. |

Two **fixture students** appear in §9 only — `alexbensonux+preqfix1@gmail.com` and `alexbensonux+preqfix2@gmail.com`. They are seeded frozen into divergent states (rejected / not-started / expiring-before-class) purely to populate the staff matrix and the follow-up list, which need several students in *different* states at once. They are never driven through a UI flow.

Every section's setup block is **state-normalizing**, not just state-creating: it asserts the journey student into exactly the state that section needs, whether or not you ran the earlier sections. So the sections still work standalone and out of order — you just get a more faithful test if you run them in order with the same sandbox.

---

## 3. Migrations 24–30 *(optional one-shot — every section below repeats what it needs)*

> **You can skip §3 and §4 entirely.** Sections 5–11 each carry their own complete setup block. These two sections exist only so someone running the whole pass in one sitting can do setup once instead of five times.

Apply in numeric order. They live in the repo, so rather than pasting 350 lines of SQL that could drift from the files, print them in order and paste the output into the Supabase SQL editor:

```bash
cd /Users/alexbenson/Repos/midwestea
for n in 24 25 26 27 28 29 30; do
  echo "-- ===== $(ls supabase/migrations/${n}_*.sql) ====="
  cat supabase/migrations/${n}_*.sql
  echo
done
```

What each one does:

| # | File | Creates |
|---|---|---|
| 24 | `24_create_prerequisite_types.sql` | `prerequisite_types` table + normalized-name unique index + RLS |
| 25 | `25_add_prerequisite_type_details.sql` | Adds `description`, `required_by_default`, `expiration_rule`, `expiration_duration_months` + the rule/duration CHECK |
| 26 | `26_create_template_prerequisites.sql` | `template_prerequisites` (assignment onto a `courses` row) |
| 27 | `27_create_class_prerequisites.sql` | `class_prerequisites` (per-class snapshot) |
| 28 | `28_create_student_credentials.sql` | `student_credentials` + `latest_student_credentials` view + private `student-credentials` storage bucket |
| 29 | `29_compute_credential_validity.sql` | `compute_credential_expiry()` function + one-time backfill |
| 30 | `30_allow_prerequisite_review_log_actions.sql` | Extends `logs_action_type_check` with `prerequisite_approved` / `prerequisite_rejected` |

**Each migration runs exactly once.** Re-running 25 throws `column "description" of relation "prerequisite_types" already exists`; re-running 24/26/27/28 throws `relation ... already exists`. That's expected — it means the migration already applied, not that something is broken. Only 29 and 30 are safely re-runnable (`CREATE OR REPLACE` and `DROP CONSTRAINT IF EXISTS`).

### Confirm the schema landed

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'prerequisite_types','template_prerequisites','class_prerequisites',
    'student_credentials','latest_student_credentials'
  )
order by table_name;

select routine_name
from information_schema.routines
where routine_schema = 'public' and routine_name = 'compute_credential_expiry';

select id, public from storage.buckets where id = 'student-credentials';
```

**Expect:** 5 rows from the first query (4 tables + the view), 1 row from the second, and 1 row from the third with `public = false`.

---

## 4. Base seed — catalog, program, and all four test classes *(optional one-shot)*

> Same note as §3: **skippable.** Each of sections 5–11 seeds exactly what it needs on its own. Run this only if you'd rather set up everything at once. It's idempotent, so running it *and* a section's own setup block is harmless.

```sql
-- ---------- Program (a `courses` row with program_type = 'program') ----------
insert into courses (course_name, course_code, program_type, type, price, registration_fee)
select 'Prerequisite Test Program', 'PREQ', 'program', 'program', 400000, 20000
where not exists (select 1 from courses where course_code = 'PREQ');

-- ---------- Prerequisite catalog: all 4 input types, all 3 expiration rules ----------
insert into prerequisite_types (name, input_type, description, required_by_default, expiration_rule, expiration_duration_months)
select v.name, v.input_type, v.description, v.required_by_default, v.expiration_rule, v.months
from (values
  ('Test BLS Card',        'file_upload', 'Upload your current BLS provider card.', true,  'duration_from_issue', 24),
  ('Test License Expiry',  'date',        'Enter the expiration date on your license.', true,  'fixed_date',          null::int),
  ('Test License Number',  'text',        'Enter your state license number.',        true,  'none',                null::int),
  ('Test Waiver Signed',   'checkbox',    'Confirm you have read the liability waiver.', true,  'none',            null::int),
  ('Test Optional Note',   'text',        'Anything else we should know? Optional.', false, 'none',                null::int)
) as v(name, input_type, description, required_by_default, expiration_rule, months)
where not exists (
  select 1 from prerequisite_types p
  where lower(btrim(p.name)) = lower(btrim(v.name)) and p.input_type = v.input_type
);

-- ---------- Assign 4 required + 1 optional onto the PREQ program template ----------
insert into template_prerequisites (course_uuid, prerequisite_type_id, is_required, sort_order)
select c.id, p.id, p.required_by_default, v.sort_order
from (values
  ('Test BLS Card', 0), ('Test License Expiry', 1), ('Test License Number', 2),
  ('Test Waiver Signed', 3), ('Test Optional Note', 4)
) as v(name, sort_order)
join prerequisite_types p on p.name = v.name
cross join (select id from courses where course_code = 'PREQ') c
on conflict (course_uuid, prerequisite_type_id) do nothing;

-- ---------- Test classes, one per section, so sections never collide ----------
insert into classes (
  course_uuid, class_name, course_code, class_id,
  enrollment_start, enrollment_close, class_start_date, class_close_date,
  price, registration_fee, wf_class_link
)
select c.id, v.class_name, 'PREQ', v.class_id,
       current_date - 7, current_date + 60, v.start_date, v.start_date + 5,
       400000, 20000, 'https://example.com/materials/' || lower(v.class_id)
from (values
  ('PREQ-683', 'Prereq Test Class (BEN-683)', (current_date + 90)::date),
  ('PREQ-686', 'Prereq Test Class (BEN-686)', (current_date + 90)::date),
  ('PREQ-684', 'Prereq Test Class (BEN-684)', (current_date + 90)::date),
  ('PREQ-685', 'Prereq Test Class (BEN-685)', (current_date + 30)::date)
) as v(class_id, class_name, start_date)
cross join (select id from courses where course_code = 'PREQ') c
where not exists (select 1 from classes cl where cl.class_id = v.class_id);

-- ---------- Snapshot the template onto each test class ----------
insert into class_prerequisites (class_id, prerequisite_type_id, is_required, sort_order, source_course_uuid)
select cl.id, tp.prerequisite_type_id, tp.is_required, tp.sort_order, tp.course_uuid
from template_prerequisites tp
join courses co on co.id = tp.course_uuid and co.course_code = 'PREQ'
join classes cl on cl.class_id in ('PREQ-683','PREQ-686','PREQ-684','PREQ-685')
on conflict (class_id, prerequisite_type_id) do nothing;
```

> **If the `courses` insert errors on the `type` column** — some environments have it nullable, some don't. Drop `type` from both the column list and the `select` and re-run; nothing else depends on it.

### Confirm the seed

```sql
select cl.class_id, count(cp.id) as prereq_count,
       count(*) filter (where cp.is_required) as required_count
from classes cl
left join class_prerequisites cp on cp.class_id = cl.id
where cl.class_id like 'PREQ-%'
group by cl.class_id order by cl.class_id;
```

**Expect:** four rows (`PREQ-683`, `PREQ-684`, `PREQ-685`, `PREQ-686`), each with `prereq_count = 5` and `required_count = 4`.

### Stripe payment link for the BEN-686 section

The BEN-686 walkthrough is the only one that needs real money movement. Create a Stripe **test-mode** Payment Link for a $200.00 registration fee, set its post-payment redirect to `http://localhost:3000/checkout/success`, then:

```sql
update classes set stripe_payment_link = 'https://buy.stripe.com/test_YOUR_LINK_HERE'
where class_id = 'PREQ-686';
```

---

## 5. BEN-687 — Catalog, template assignment, and class snapshotting

> **Self-contained preconditions.** Branch `687-tiered-enrollment` (or `685-tiered-enrollment`). Admin login working. `npm run dev` running. No student account and no Stripe needed — this section is entirely admin-side.

### Setup — run this first

**Migrations.** Print migrations 24–27 in order and paste the output into the Supabase SQL editor:

```bash
cd /Users/alexbenson/Repos/midwestea
for n in 24 25 26 27; do
  echo "-- ===== $(ls supabase/migrations/${n}_*.sql) ====="
  cat supabase/migrations/${n}_*.sql
  echo
done
```

Each migration runs exactly once — a `relation already exists` or `column already exists` error means it's already applied, not that something is broken.

**Seed data.** Idempotent; safe to re-run.

```sql
insert into courses (course_name, course_code, program_type, type, price, registration_fee)
select 'Prerequisite Test Program', 'PREQ', 'program', 'program', 400000, 20000
where not exists (select 1 from courses where course_code = 'PREQ');

insert into prerequisite_types (name, input_type, description, required_by_default, expiration_rule, expiration_duration_months)
select v.name, v.input_type, v.description, v.required_by_default, v.expiration_rule, v.months
from (values
  ('Test BLS Card',       'file_upload', 'Upload your current BLS provider card.',      true,  'duration_from_issue', 24),
  ('Test License Expiry', 'date',        'Enter the expiration date on your license.',  true,  'fixed_date',          null::int),
  ('Test License Number', 'text',        'Enter your state license number.',            true,  'none',                null::int),
  ('Test Waiver Signed',  'checkbox',    'Confirm you have read the liability waiver.', true,  'none',                null::int),
  ('Test Optional Note',  'text',        'Anything else we should know? Optional.',     false, 'none',                null::int)
) as v(name, input_type, description, required_by_default, expiration_rule, months)
where not exists (
  select 1 from prerequisite_types p
  where lower(btrim(p.name)) = lower(btrim(v.name)) and p.input_type = v.input_type
);

insert into template_prerequisites (course_uuid, prerequisite_type_id, is_required, sort_order)
select c.id, p.id, p.required_by_default, v.sort_order
from (values
  ('Test BLS Card', 0), ('Test License Expiry', 1), ('Test License Number', 2),
  ('Test Waiver Signed', 3), ('Test Optional Note', 4)
) as v(name, sort_order)
join prerequisite_types p on p.name = v.name
cross join (select id from courses where course_code = 'PREQ') c
on conflict (course_uuid, prerequisite_type_id) do nothing;
```

> If the `courses` insert errors on the `type` column, drop `type` from both the column list and the `select` and re-run — some environments have it nullable.

**Confirm:**

```sql
select p.name, tp.is_required, tp.sort_order
from template_prerequisites tp
join prerequisite_types p on p.id = tp.prerequisite_type_id
join courses c on c.id = tp.course_uuid and c.course_code = 'PREQ'
order by tp.sort_order;
```

**Expect:** five rows, `sort_order` `0`–`4`, with `Test Optional Note` showing `is_required = false`.

### 5a. Catalog is picker-first

1. Sign in as an admin, go to `http://localhost:3000/admin/prerequisites`.
2. **Expect:** a `Prerequisites` item in the admin sidebar, and a table listing the five seeded types with their input type, required flag, and expiration.
3. Click **Add prerequisite**, type `Test BLS` into the search field.
4. **Expect:** `Test BLS Card` appears as a match, and **no** create-new prompt.
5. Clear the field and type `Zzz Nonexistent Cert`.
6. **Expect:** the create-new affordance appears reading `No match for "Zzz Nonexistent Cert". Create it:` with an input-type selector.
7. Leave input type at **File upload**, click the create button.
8. **Expect:** it saves and becomes immediately selectable.

### 5b. Normalized uniqueness is enforced

```sql
-- Same name with different casing/whitespace, same input type -> must FAIL
insert into prerequisite_types (name, input_type) values ('  test bls card  ', 'file_upload');
```

**Expect:** `duplicate key value violates unique constraint "prerequisite_types_name_input_type_key"`.

```sql
-- Same name, DIFFERENT input type -> must SUCCEED
insert into prerequisite_types (name, input_type) values ('Test BLS Card', 'date');
```

**Expect:** succeeds. Then clean it up:

```sql
delete from prerequisite_types where name = 'Test BLS Card' and input_type = 'date';
delete from prerequisite_types where name = 'Zzz Nonexistent Cert';
```

### 5c. Expiration rule and duration must agree

```sql
-- Rule set to duration_from_issue with no duration -> must FAIL
update prerequisite_types set expiration_rule = 'duration_from_issue', expiration_duration_months = null
where name = 'Test License Number';
```

**Expect:** `violates check constraint "prerequisite_types_expiration_rule_check"`.

```sql
-- Zero months -> must also FAIL
update prerequisite_types set expiration_rule = 'duration_from_issue', expiration_duration_months = 0
where name = 'Test License Number';
```

**Expect:** same constraint violation. `Test License Number` should still read `expiration_rule = 'none'` afterward.

### 5d. Template assignment preserves order and required flag

1. Go to `http://localhost:3000/admin/programs`, open **Prerequisite Test Program**.
2. **Expect:** a `Prerequisites` card between the program details and the classes table, with helper copy `Classes created from this program will copy this list. Existing classes keep the list they were created with.`
3. **Expect:** five rows in seeded order — `Test BLS Card`, `Test License Expiry`, `Test License Number`, `Test Waiver Signed`, `Test Optional Note` — with `Test Optional Note` showing **Required** unchecked.
4. Click **▼** on the first row.
5. **Expect:** it swaps with the second row. **▲** is disabled on row 1, **▼** disabled on row 5.

```sql
select p.name, tp.is_required, tp.sort_order
from template_prerequisites tp
join prerequisite_types p on p.id = tp.prerequisite_type_id
join courses c on c.id = tp.course_uuid
where c.course_code = 'PREQ'
order by tp.sort_order;
```

**Expect:** `sort_order` is a dense `0,1,2,3,4` with no gaps, reflecting the reorder you just did.

### 5e. Snapshot copies at creation time and never rewrites

1. On the same program page click **Add Class**, fill in the modal, submit.
2. Note the new class's code from the classes table (it will be `PREQ-00N`).
3. Open `http://localhost:3000/admin/classes/` and click into the class you just created.
4. **Expect:** a read-only `Prerequisites` card with copy `Copied from the template when this class was created. Editing the template does not change this list.`, listing the same five prerequisites in the same order, **with no add/edit/remove controls.**

```sql
-- Re-derives the newest PREQ class without needing a pasted UUID
select p.name, cp.is_required, cp.sort_order
from class_prerequisites cp
join prerequisite_types p on p.id = cp.prerequisite_type_id
where cp.class_id = (
  select id from classes where course_code = 'PREQ' and class_id ~ '^PREQ-[0-9]+$'
  order by created_at desc limit 1
)
order by cp.sort_order;
```

**Expect:** five rows matching the template's order and required flags, and `source_course_uuid` set to the PREQ program's id.

5. **The core check.** Go back to the program page and **Remove** one prerequisite from the template.
6. Reload the class detail page from step 3.
7. **Expect:** the class's list is **completely unchanged** — still five items. Re-run the query above to confirm the rows are untouched.
8. Create a **second** class from the same program.
9. **Expect:** the new class's snapshot has **four** items, reflecting the edited template. Snapshots are taken at creation time.

### 5f. Restore the seed

```sql
insert into template_prerequisites (course_uuid, prerequisite_type_id, is_required, sort_order)
select c.id, p.id, p.required_by_default, 9
from prerequisite_types p
cross join (select id from courses where course_code = 'PREQ') c
where p.name = 'Test BLS Card'
on conflict (course_uuid, prerequisite_type_id) do nothing;
```

### Pass criteria — BEN-687

- [ ] `/admin/prerequisites` lists, creates (picker-first), and edits catalog types.
- [ ] Create-new appears only when search returns zero matches.
- [ ] Normalized-name uniqueness rejects case/whitespace duplicates but allows the same name on a different input type.
- [ ] The expiration rule/duration CHECK rejects both `null` and `0` durations for `duration_from_issue`.
- [ ] Template assignment preserves ordering and required status, with dense `sort_order`.
- [ ] A new class receives a copied snapshot; editing the template afterward leaves it untouched; a later class picks up the change.

---

## 6. BEN-683 — Credential records, evaluation, and expiry

> **Self-contained preconditions.** Branch `683-tiered-enrollment` (or `685-tiered-enrollment`). `npm run dev` running. No Stripe needed — this section seeds its enrollment directly. Uses class **`PREQ-683`** and test student **`alexbensonux+preqjourney@gmail.com`**.

### 6a. Setup — run this first

**Migrations.** Print migrations 24–29 in order and paste the output into the Supabase SQL editor:

```bash
cd /Users/alexbenson/Repos/midwestea
for n in 24 25 26 27 28 29; do
  echo "-- ===== $(ls supabase/migrations/${n}_*.sql) ====="
  cat supabase/migrations/${n}_*.sql
  echo
done
```

Each runs exactly once — an `already exists` error means it's already applied.

**Student account.** In the Supabase Dashboard → **Authentication → Users → Add user**, create `alexbensonux+preqjourney@gmail.com` and auto-confirm it.

**Seed data.** Idempotent; safe to re-run.

```sql
-- Program + catalog
insert into courses (course_name, course_code, program_type, type, price, registration_fee)
select 'Prerequisite Test Program', 'PREQ', 'program', 'program', 400000, 20000
where not exists (select 1 from courses where course_code = 'PREQ');

insert into prerequisite_types (name, input_type, description, required_by_default, expiration_rule, expiration_duration_months)
select v.name, v.input_type, v.description, v.required_by_default, v.expiration_rule, v.months
from (values
  ('Test BLS Card',       'file_upload', 'Upload your current BLS provider card.',      true,  'duration_from_issue', 24),
  ('Test License Expiry', 'date',        'Enter the expiration date on your license.',  true,  'fixed_date',          null::int),
  ('Test License Number', 'text',        'Enter your state license number.',            true,  'none',                null::int),
  ('Test Waiver Signed',  'checkbox',    'Confirm you have read the liability waiver.', true,  'none',                null::int),
  ('Test Optional Note',  'text',        'Anything else we should know? Optional.',     false, 'none',                null::int)
) as v(name, input_type, description, required_by_default, expiration_rule, months)
where not exists (
  select 1 from prerequisite_types p
  where lower(btrim(p.name)) = lower(btrim(v.name)) and p.input_type = v.input_type
);

insert into template_prerequisites (course_uuid, prerequisite_type_id, is_required, sort_order)
select c.id, p.id, p.required_by_default, v.sort_order
from (values
  ('Test BLS Card', 0), ('Test License Expiry', 1), ('Test License Number', 2),
  ('Test Waiver Signed', 3), ('Test Optional Note', 4)
) as v(name, sort_order)
join prerequisite_types p on p.name = v.name
cross join (select id from courses where course_code = 'PREQ') c
on conflict (course_uuid, prerequisite_type_id) do nothing;

-- Two classes: PREQ-683 for the main walkthrough, PREQ-684 for the cross-class reuse check in 6f
insert into classes (
  course_uuid, class_name, course_code, class_id,
  enrollment_start, enrollment_close, class_start_date, class_close_date,
  price, registration_fee, wf_class_link
)
select c.id, v.class_name, 'PREQ', v.class_id,
       current_date - 7, current_date + 60, (current_date + 90)::date, (current_date + 95)::date,
       400000, 20000, 'https://example.com/materials/' || lower(v.class_id)
from (values
  ('PREQ-683', 'Prereq Test Class (BEN-683)'),
  ('PREQ-684', 'Prereq Test Class (BEN-684)')
) as v(class_id, class_name)
cross join (select id from courses where course_code = 'PREQ') c
where not exists (select 1 from classes cl where cl.class_id = v.class_id);

insert into class_prerequisites (class_id, prerequisite_type_id, is_required, sort_order, source_course_uuid)
select cl.id, tp.prerequisite_type_id, tp.is_required, tp.sort_order, tp.course_uuid
from template_prerequisites tp
join courses co on co.id = tp.course_uuid and co.course_code = 'PREQ'
join classes cl on cl.class_id in ('PREQ-683','PREQ-684')
on conflict (class_id, prerequisite_type_id) do nothing;

-- Student + enrollment
insert into students (id, first_name, last_name)
select u.id, 'Preq', 'Journey'
from auth.users u where u.email = 'alexbensonux+preqjourney@gmail.com'
on conflict (id) do nothing;

insert into enrollments (student_id, class_id, enrollment_status)
select s.id, cl.id, 'registered'
from students s
join auth.users u on u.id = s.id and u.email = 'alexbensonux+preqjourney@gmail.com'
cross join (select id from classes where class_id = 'PREQ-683') cl
where not exists (
  select 1 from enrollments e where e.student_id = s.id and e.class_id = cl.id
);
```

> If the `courses` insert errors on the `type` column, drop `type` from both the column list and the `select` and re-run.

### 6b. Baseline — everything unmet, optional excluded

```sql
select p.name, cp.is_required, sc.review_status, sc.expires_at
from class_prerequisites cp
join prerequisite_types p on p.id = cp.prerequisite_type_id
left join latest_student_credentials sc
  on sc.prerequisite_type_id = cp.prerequisite_type_id
 and sc.student_id = (select u.id from auth.users u where u.email = 'alexbensonux+preqjourney@gmail.com')
where cp.class_id = (select id from classes where class_id = 'PREQ-683')
order by cp.sort_order;
```

**Expect:** five rows, all with `review_status = null` (no credential yet). Four are `is_required = true`; `Test Optional Note` is `false`.

### 6c. History is preserved — a resubmission never overwrites

```sql
-- First submission
insert into student_credentials (student_id, prerequisite_type_id, submitted_for_class_id, value_text, review_status, submitted_at)
select u.id, p.id, cl.id, 'LIC-FIRST-001', 'pending', now() - interval '1 hour'
from auth.users u, prerequisite_types p, classes cl
where u.email = 'alexbensonux+preqjourney@gmail.com'
  and p.name = 'Test License Number' and cl.class_id = 'PREQ-683';

-- Second submission for the same type: supersede the first, insert a new row
update student_credentials sc set review_status = 'superseded', updated_at = now()
where sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and sc.prerequisite_type_id = (select id from prerequisite_types where name = 'Test License Number')
  and sc.review_status in ('pending','approved','rejected');

insert into student_credentials (student_id, prerequisite_type_id, submitted_for_class_id, value_text, review_status, submitted_at)
select u.id, p.id, cl.id, 'LIC-SECOND-002', 'pending', now()
from auth.users u, prerequisite_types p, classes cl
where u.email = 'alexbensonux+preqjourney@gmail.com'
  and p.name = 'Test License Number' and cl.class_id = 'PREQ-683';
```

```sql
select sc.value_text, sc.review_status, sc.submitted_at
from student_credentials sc
where sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and sc.prerequisite_type_id = (select id from prerequisite_types where name = 'Test License Number')
order by sc.submitted_at;
```

**Expect:** **two** rows. `LIC-FIRST-001` is `superseded` and **still present**; `LIC-SECOND-002` is `pending`. Nothing was deleted or overwritten in place.

```sql
select value_text, review_status from latest_student_credentials
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and prerequisite_type_id = (select id from prerequisite_types where name = 'Test License Number');
```

**Expect:** exactly one row — `LIC-SECOND-002`. The view is the single shared definition of "current credential".

### 6d. The value-presence constraint

```sql
insert into student_credentials (student_id, prerequisite_type_id)
select u.id, p.id from auth.users u, prerequisite_types p
where u.email = 'alexbensonux+preqjourney@gmail.com' and p.name = 'Test Waiver Signed';
```

**Expect:** `violates check constraint "student_credentials_value_present_check"` — at least one typed value column must be populated.

```sql
update student_credentials set review_status = 'not_a_real_status'
where value_text = 'LIC-SECOND-002';
```

**Expect:** violates the `review_status` CHECK.

### 6e. Expiry is computed in Postgres, with month-end clamping

```sql
select compute_credential_expiry('2026-01-15', 'duration_from_issue', 24) as two_years,
       compute_credential_expiry('2026-01-31', 'duration_from_issue', 1)  as month_end_clamp,
       compute_credential_expiry('2026-01-15', 'none', null)              as never_expires,
       compute_credential_expiry(null, 'duration_from_issue', 24)         as no_issue_date;
```

**Expect:** `2028-01-15`, **`2026-02-28`**, `null`, `null`. The month-end clamp is the whole reason this lives in Postgres rather than JavaScript.

### 6f. Cross-class reuse — the point of the whole L1

```sql
-- Approve an unexpired BLS card, submitted against a DIFFERENT class (PREQ-684)
insert into student_credentials (
  student_id, prerequisite_type_id, submitted_for_class_id,
  file_url, review_status, issued_at, expires_at, reviewed_at, submitted_at
)
select u.id, p.id, cl.id,
       u.id::text || '/' || p.id::text || '/seeded-bls.pdf', 'approved',
       current_date - 30, current_date + 700, now(), now()
from auth.users u, prerequisite_types p, classes cl
where u.email = 'alexbensonux+preqjourney@gmail.com'
  and p.name = 'Test BLS Card' and cl.class_id = 'PREQ-684';
```

```sql
select p.name, sc.review_status, sc.expires_at, sc.submitted_for_class_id = cl.id as submitted_for_this_class
from class_prerequisites cp
join prerequisite_types p on p.id = cp.prerequisite_type_id
join classes cl on cl.id = cp.class_id
left join latest_student_credentials sc
  on sc.prerequisite_type_id = cp.prerequisite_type_id
 and sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
where cl.class_id = 'PREQ-683' and p.name = 'Test BLS Card';
```

**Expect:** `review_status = 'approved'` and `submitted_for_this_class = false`. An approved credential satisfies **PREQ-683** even though it was submitted against **PREQ-684** — credentials are student-owned, not enrollment-owned.

### 6g. Expiry boundaries

```sql
-- Expiring exactly today -> still VALID
update student_credentials set expires_at = current_date
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and prerequisite_type_id = (select id from prerequisite_types where name = 'Test BLS Card');
```

Sign in at `http://localhost:3000/student/login` as `alexbensonux+preqjourney@gmail.com`, open `http://localhost:3000/student/profile`, expand **Prereq Test Class (BEN-683)**.

**Expect:** `Test BLS Card` reads **Approved** — a credential expiring today is not yet expired.

```sql
-- Expiring yesterday -> EXPIRED
update student_credentials set expires_at = current_date - 1
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and prerequisite_type_id = (select id from prerequisite_types where name = 'Test BLS Card');
```

Reload the profile. **Expect:** `Test BLS Card` now reads **Expired** with a `Renew` link.

```sql
-- Restore for later sections
update student_credentials set expires_at = current_date + 700
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and prerequisite_type_id = (select id from prerequisite_types where name = 'Test BLS Card');
```

### 6h. Hand off a clean state to the next branch

The `Test License Number` rows from **6c** were scratch data for the history-preservation check, not part of this student's story. Leaving them `pending` would silently remove a step from the BEN-686 wizard later — a `pending_review` item counts as *not* outstanding, so it wouldn't be asked for again. Clear them:

```sql
delete from student_credentials
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and prerequisite_type_id = (select id from prerequisite_types where name = 'Test License Number');
```

**Confirm the exact handoff state:**

```sql
select p.name, sc.review_status, sc.expires_at
from student_credentials sc
join prerequisite_types p on p.id = sc.prerequisite_type_id
where sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
order by p.name;
```

**Expect: exactly one row** — `Test BLS Card`, `approved`, expiring roughly two years out. That single credential is what makes the BEN-686 section's cross-class reuse visible: when this student registers for a different class that also requires a BLS card, the wizard should ask for **three** prerequisites, not four.

### Pass criteria — BEN-683

- [ ] Credential rows store `review_status`, `issued_at`, and `expires_at` on the record itself.
- [ ] A resubmission inserts a new row and marks the prior one `superseded` — the old row and its data survive.
- [ ] `latest_student_credentials` returns exactly one current row per (student, prerequisite type).
- [ ] The value-presence and `review_status` CHECK constraints both reject bad writes.
- [ ] `compute_credential_expiry` clamps `2026-01-31 + 1 month` to `2026-02-28`.
- [ ] An approved credential satisfies a **different** class requiring the same type, with no resubmission.
- [ ] A credential expiring today is valid; expiring yesterday is expired.

---

## 7. BEN-686 — Post-payment handoff and profile completion

> **Self-contained preconditions.** Branch `686-tiered-enrollment` (or `685-tiered-enrollment`). `npm run dev` and `stripe listen --forward-to localhost:3000/api/webhooks/stripe` both running. Stripe test mode. OTP email delivery working. Uses class **`PREQ-686`** and test student **`alexbensonux+preqjourney@gmail.com`**.

This is the only section that needs Stripe — the payment→prerequisite handoff is the thing under test.

**Don't pre-create the student here.** Registering through checkout creates (or reuses) the account on its own. If you ran the BEN-683 section against this sandbox, `alexbensonux+preqjourney@gmail.com` already exists and already holds an approved `Test BLS Card` — checkout will reuse that account, and that carried-over credential is what produces the 3-step wizard in **7d**. If you're running this section standalone, the account is created fresh and you'll see 4 steps instead; both are valid, just note which case you're in.

### 7a. Setup — run this first

**Migrations.** Print migrations 24–29 in order and paste the output into the Supabase SQL editor:

```bash
cd /Users/alexbenson/Repos/midwestea
for n in 24 25 26 27 28 29; do
  echo "-- ===== $(ls supabase/migrations/${n}_*.sql) ====="
  cat supabase/migrations/${n}_*.sql
  echo
done
```

Each runs exactly once — an `already exists` error means it's already applied.

**Stripe payment link.** Create a Stripe **test-mode** Payment Link for a $200.00 registration fee and set its post-payment redirect to `http://localhost:3000/checkout/success`. You'll paste it into the seed below.

**Seed data.** Idempotent; safe to re-run. Replace `https://buy.stripe.com/test_YOUR_LINK_HERE` with your link.

```sql
insert into courses (course_name, course_code, program_type, type, price, registration_fee)
select 'Prerequisite Test Program', 'PREQ', 'program', 'program', 400000, 20000
where not exists (select 1 from courses where course_code = 'PREQ');

insert into prerequisite_types (name, input_type, description, required_by_default, expiration_rule, expiration_duration_months)
select v.name, v.input_type, v.description, v.required_by_default, v.expiration_rule, v.months
from (values
  ('Test BLS Card',       'file_upload', 'Upload your current BLS provider card.',      true,  'duration_from_issue', 24),
  ('Test License Expiry', 'date',        'Enter the expiration date on your license.',  true,  'fixed_date',          null::int),
  ('Test License Number', 'text',        'Enter your state license number.',            true,  'none',                null::int),
  ('Test Waiver Signed',  'checkbox',    'Confirm you have read the liability waiver.', true,  'none',                null::int),
  ('Test Optional Note',  'text',        'Anything else we should know? Optional.',     false, 'none',                null::int)
) as v(name, input_type, description, required_by_default, expiration_rule, months)
where not exists (
  select 1 from prerequisite_types p
  where lower(btrim(p.name)) = lower(btrim(v.name)) and p.input_type = v.input_type
);

insert into template_prerequisites (course_uuid, prerequisite_type_id, is_required, sort_order)
select c.id, p.id, p.required_by_default, v.sort_order
from (values
  ('Test BLS Card', 0), ('Test License Expiry', 1), ('Test License Number', 2),
  ('Test Waiver Signed', 3), ('Test Optional Note', 4)
) as v(name, sort_order)
join prerequisite_types p on p.name = v.name
cross join (select id from courses where course_code = 'PREQ') c
on conflict (course_uuid, prerequisite_type_id) do nothing;

insert into classes (
  course_uuid, class_name, course_code, class_id,
  enrollment_start, enrollment_close, class_start_date, class_close_date,
  price, registration_fee, wf_class_link, stripe_payment_link
)
select c.id, 'Prereq Test Class (BEN-686)', 'PREQ', 'PREQ-686',
       current_date - 7, current_date + 60, (current_date + 90)::date, (current_date + 95)::date,
       400000, 20000, 'https://example.com/materials/preq-686',
       'https://buy.stripe.com/test_YOUR_LINK_HERE'
from (select id from courses where course_code = 'PREQ') c
where not exists (select 1 from classes cl where cl.class_id = 'PREQ-686');

insert into class_prerequisites (class_id, prerequisite_type_id, is_required, sort_order, source_course_uuid)
select cl.id, tp.prerequisite_type_id, tp.is_required, tp.sort_order, tp.course_uuid
from template_prerequisites tp
join courses co on co.id = tp.course_uuid and co.course_code = 'PREQ'
join classes cl on cl.class_id = 'PREQ-686'
on conflict (class_id, prerequisite_type_id) do nothing;

-- If PREQ-686 already existed, make sure the link and enrollment window are current
update classes
set stripe_payment_link = 'https://buy.stripe.com/test_YOUR_LINK_HERE',
    enrollment_start = current_date - 7,
    enrollment_close = current_date + 60
where class_id = 'PREQ-686';
```

> If the `courses` insert errors on the `type` column, drop `type` from both the column list and the `select` and re-run.

**Confirm the class is payable:**

```sql
select class_id, class_name, enrollment_start, enrollment_close,
       stripe_payment_link is not null as has_payment_link,
       (select count(*) from class_prerequisites cp where cp.class_id = c.id) as prereq_count
from classes c where class_id = 'PREQ-686';
```

**Expect:** `enrollment_start` in the past, `enrollment_close` in the future, `has_payment_link = true`, `prereq_count = 5`.

### 7b. Register and pay

1. Go to `http://localhost:3000/checkout/details?classID=PREQ-686`.
2. Enter email `alexbensonux+preqjourney@gmail.com` and full name `Preq Journey` → continue.
3. On the confirm screen, click through to Stripe.
4. Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC.
5. Watch the `npm run dev` terminal for the webhook creating the enrollment.

**Expect on return:** `/checkout/success` shows **Payment Successful!** plus a **Continue to class requirements** button and the line `You'll be asked to sign in to continue.` There should be **no** "Return to Home" button pointing at `/admin`.

### 7c. The handoff preserves the destination through OTP

1. Click **Continue to class requirements**.
2. **Expect:** you land on `/student/login?next=%2Fstudent%2Fprerequisites%2FPREQ-686`.
3. Complete OTP sign-in with the code emailed to `alexbensonux+preqjourney@gmail.com`.
4. **Expect:** you land on `/student/prerequisites/PREQ-686` — **not** `/student`.

### 7d. Only unmet prerequisites appear, and only as steps

**Expect on that page:** header `Class requirements`, **`Step 1 of 3`**, one prerequisite per screen.

Three things to check here, and the first is the important one:

- **`Step 1 of 3`, not `Step 1 of 4`.** `PREQ-686` requires four items, but this student already holds an approved, unexpired `Test BLS Card` from the BEN-683 section — carried on the *student*, not the enrollment. The wizard silently drops it. **This is cross-class credential reuse demonstrated through the real UI**, and it's the single most valuable assertion in this section.
- **`Test BLS Card` never appears as a step at all.** Page through all three and confirm.
- **`Test Optional Note` never appears either** — optional items are never steps.
- **No mention anywhere of payment, invoices, balance, or tiers.**

> If you see `Step 1 of 4` and are asked for the BLS card, the student is missing their approved credential — either the BEN-683 section wasn't run against this sandbox, or its handoff cleanup removed too much. Re-run the BEN-683 setup and confirm with:
> ```sql
> select p.name, sc.review_status, sc.expires_at from student_credentials sc
> join prerequisite_types p on p.id = sc.prerequisite_type_id
> where sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com');
> ```
> If you're running this section standalone and *want* the full four steps, that's fine — just expect `of 4` throughout the rest of this section.

### 7e. Submit one, skip one

1. On step 1, complete it and submit.
2. **Expect:** advances to `Step 2 of 3`.
3. On step 2, click **Skip for now**.
4. **Expect:** advances to `Step 3 of 3`.
5. Complete step 3.

```sql
select p.name, sc.review_status, sc.issued_at, sc.expires_at
from student_credentials sc
join prerequisite_types p on p.id = sc.prerequisite_type_id
where sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
order by sc.submitted_at;
```

**Expect:** the pre-existing approved `Test BLS Card`, plus **two new `pending` rows** for the items you just submitted. The skipped prerequisite has **no row at all** — skipping writes nothing.

### 7f. Re-entry never re-asks for completed work

1. Go to `http://localhost:3000/student/profile`.
2. **Expect:** a `Class requirements` card listing **Prereq Test Class (BEN-686)** reading `1 requirement outstanding` with a **Continue** link.
3. Click **Continue**.
4. **Expect:** `/student/prerequisites/PREQ-686?from=profile`, a `← Back to profile` link, and **`Step 1 of 1`** showing only the skipped item. The submitted items do **not** reappear, and neither does the BLS card carried over from the BEN-683 section.
5. Complete it.
6. **Expect:** the completion panel, and the profile now reads `Awaiting review`.

### 7g. The open-redirect guard

1. Sign out, then visit `http://localhost:3000/student/login?next=https://evil.example.com`.
2. Complete OTP sign-in.
3. **Expect:** you land on `/student`, **never** the external URL. Only paths starting with `/student/` are honored.

### Pass criteria — BEN-686

- [ ] Paying the registration fee lands on `/checkout/success` with a route into prerequisites, not `/admin`.
- [ ] The intended destination survives login **and** OTP.
- [ ] **The wizard shows 3 steps, not 4** — the credential this student already holds from the BEN-683 section is silently satisfied, with no resubmission.
- [ ] Only unmet, required prerequisites appear as steps; the optional one never does.
- [ ] Each step submits immediately; **Skip for now** writes nothing.
- [ ] Returning from the profile shows only what's still outstanding — completed work persists.
- [ ] `next` values not starting with `/student/` are rejected.
- [ ] No payment/invoice/balance/tier language anywhere in the student flow.

---

## 8. BEN-684 — Staff review and resubmission history

> **Self-contained preconditions.** Branch `684-tiered-enrollment` (or `685-tiered-enrollment`). Admin login and OTP email delivery working. `npm run dev` running. No Stripe needed. Uses class **`PREQ-684`** and test student **`alexbensonux+preqjourney@gmail.com`**.

### 8a. Setup — run this first

**Migrations.** Print migrations 24–**30** in order and paste the output into the Supabase SQL editor. Migration 30 is mandatory here — the review actions write new `logs.action_type` values and will fail without it:

```bash
cd /Users/alexbenson/Repos/midwestea
for n in 24 25 26 27 28 29 30; do
  echo "-- ===== $(ls supabase/migrations/${n}_*.sql) ====="
  cat supabase/migrations/${n}_*.sql
  echo
done
```

Each runs exactly once — an `already exists` error means it's already applied.

**Student account.** In the Supabase Dashboard → **Authentication → Users → Add user**, create `alexbensonux+preqjourney@gmail.com` and auto-confirm it.

**Seed data.** Idempotent; safe to re-run. Creates the catalog, class, enrollment, and two pending submissions to review.

```sql
insert into courses (course_name, course_code, program_type, type, price, registration_fee)
select 'Prerequisite Test Program', 'PREQ', 'program', 'program', 400000, 20000
where not exists (select 1 from courses where course_code = 'PREQ');

insert into prerequisite_types (name, input_type, description, required_by_default, expiration_rule, expiration_duration_months)
select v.name, v.input_type, v.description, v.required_by_default, v.expiration_rule, v.months
from (values
  ('Test BLS Card',       'file_upload', 'Upload your current BLS provider card.',      true,  'duration_from_issue', 24),
  ('Test License Expiry', 'date',        'Enter the expiration date on your license.',  true,  'fixed_date',          null::int),
  ('Test License Number', 'text',        'Enter your state license number.',            true,  'none',                null::int),
  ('Test Waiver Signed',  'checkbox',    'Confirm you have read the liability waiver.', true,  'none',                null::int),
  ('Test Optional Note',  'text',        'Anything else we should know? Optional.',     false, 'none',                null::int)
) as v(name, input_type, description, required_by_default, expiration_rule, months)
where not exists (
  select 1 from prerequisite_types p
  where lower(btrim(p.name)) = lower(btrim(v.name)) and p.input_type = v.input_type
);

insert into template_prerequisites (course_uuid, prerequisite_type_id, is_required, sort_order)
select c.id, p.id, p.required_by_default, v.sort_order
from (values
  ('Test BLS Card', 0), ('Test License Expiry', 1), ('Test License Number', 2),
  ('Test Waiver Signed', 3), ('Test Optional Note', 4)
) as v(name, sort_order)
join prerequisite_types p on p.name = v.name
cross join (select id from courses where course_code = 'PREQ') c
on conflict (course_uuid, prerequisite_type_id) do nothing;

insert into classes (
  course_uuid, class_name, course_code, class_id,
  enrollment_start, enrollment_close, class_start_date, class_close_date,
  price, registration_fee, wf_class_link
)
select c.id, 'Prereq Test Class (BEN-684)', 'PREQ', 'PREQ-684',
       current_date - 7, current_date + 60, (current_date + 90)::date, (current_date + 95)::date,
       400000, 20000, 'https://example.com/materials/preq-684'
from (select id from courses where course_code = 'PREQ') c
where not exists (select 1 from classes cl where cl.class_id = 'PREQ-684');

insert into class_prerequisites (class_id, prerequisite_type_id, is_required, sort_order, source_course_uuid)
select cl.id, tp.prerequisite_type_id, tp.is_required, tp.sort_order, tp.course_uuid
from template_prerequisites tp
join courses co on co.id = tp.course_uuid and co.course_code = 'PREQ'
join classes cl on cl.class_id = 'PREQ-684'
on conflict (class_id, prerequisite_type_id) do nothing;

insert into students (id, first_name, last_name)
select u.id, 'Preq', 'Journey' from auth.users u
where u.email = 'alexbensonux+preqjourney@gmail.com'
on conflict (id) do nothing;

insert into enrollments (student_id, class_id, enrollment_status)
select s.id, cl.id, 'registered'
from students s
join auth.users u on u.id = s.id and u.email = 'alexbensonux+preqjourney@gmail.com'
cross join (select id from classes where class_id = 'PREQ-684') cl
where not exists (select 1 from enrollments e where e.student_id = s.id and e.class_id = cl.id);

-- Two pending submissions waiting for review
insert into student_credentials (student_id, prerequisite_type_id, submitted_for_class_id, value_text, review_status, submitted_at)
select u.id, p.id, cl.id, 'LIC-684-REVIEWME', 'pending', now()
from auth.users u, prerequisite_types p, classes cl
where u.email = 'alexbensonux+preqjourney@gmail.com'
  and p.name = 'Test License Number' and cl.class_id = 'PREQ-684'
  and not exists (select 1 from student_credentials sc where sc.value_text = 'LIC-684-REVIEWME');

insert into student_credentials (student_id, prerequisite_type_id, submitted_for_class_id, value_boolean, review_status, submitted_at)
select u.id, p.id, cl.id, true, 'pending', now()
from auth.users u, prerequisite_types p, classes cl
where u.email = 'alexbensonux+preqjourney@gmail.com'
  and p.name = 'Test Waiver Signed' and cl.class_id = 'PREQ-684'
  and not exists (
    select 1 from student_credentials sc
    where sc.student_id = u.id and sc.prerequisite_type_id = p.id
  );
```

> If the `courses` insert errors on the `type` column, drop `type` from both the column list and the `select` and re-run.

### 8b. The review queue

1. Sign in as an admin, go to `http://localhost:3000/admin/approvals`.
2. **Expect:** a real queue (not the old "No pending approvals" stub), newest first, showing student name, class name, prerequisite name, and submitted date. Both of `Preq Journey`'s pending items are listed.
3. Click one of them.
4. **Expect:** a sidebar titled `<student> · Prereq Test Class (BEN-684)` showing **all five** class prerequisites — not just the pending ones — each with prerequisite type, submitted value, issued date, expiration date, and current status. Each entry says `Required for ...` or `Optional for this class`.

### 8c. Admin guard

```bash
curl -i http://localhost:3000/api/admin/prerequisites/queue
```

**Expect:** HTTP 401. With a **student's** bearer token instead, expect HTTP 403 `Admin access required`.

### 8d. Approve and reject

1. In the review sidebar, click **Approve** on `Test Waiver Signed`.
2. **Expect:** the badge flips to **Approved**, and the row disappears from the `/admin/approvals` queue.
3. Click **Reject** on `Test License Number`.
4. **Expect:** an inline reason textarea appears with **Confirm rejection** disabled while it's empty.
5. Type `License number does not match state records` and confirm.

```sql
select p.name, sc.review_status, sc.rejection_reason,
       sc.reviewed_by is not null as has_reviewer, sc.reviewed_at is not null as has_timestamp
from student_credentials sc
join prerequisite_types p on p.id = sc.prerequisite_type_id
where sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and sc.review_status in ('approved','rejected')
order by p.name;
```

**Expect:** `Test Waiver Signed` = `approved` with `rejection_reason` **null**; `Test License Number` = `rejected` carrying the exact reason. Both have a reviewer and a timestamp.

### 8e. A blank rejection reason is refused

```bash
curl -i -X POST http://localhost:3000/api/admin/prerequisites/review \
  -H "Authorization: Bearer <YOUR_ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"credentialId":"<CREDENTIAL_ID>","decision":"rejected","rejectionReason":"   "}'
```

Get both values without leaving SQL:

```sql
select sc.id as credential_id
from student_credentials sc
where sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and sc.review_status = 'rejected' limit 1;
```

(For the admin token: sign in at `/admin/login`, then in the browser console run `JSON.parse(Object.entries(localStorage).find(([k])=>k.includes('auth-token'))[1]).access_token`.)

**Expect:** HTTP 400 with the exact error `A rejection reason is required.` Also try `"decision":"maybe"` → HTTP 400 `decision must be "approved" or "rejected".`

### 8f. The rejection email routes the student back

Check the inbox for `alexbensonux+preqjourney@gmail.com`.

**Expect:** subject `Action needed: Test License Number`, body containing the reason `License number does not match state records`, and a **Resubmit now** button linking to `/student/prerequisites/PREQ-684?from=profile`.

```sql
select email_type, recipient_email, subject, success
from email_logs order by created_at desc limit 3;
```

**Expect:** a `prerequisite_rejected` row for that address with `success = true`.

### 8g. Resubmission preserves the rejected record

1. Sign in as `alexbensonux+preqjourney@gmail.com`, click through the email's **Resubmit now**.
2. **Expect:** the step for `Test License Number` with the reason shown in red above the input.
3. Submit a replacement value.

```sql
select sc.value_text, sc.review_status, sc.rejection_reason, sc.submitted_at
from student_credentials sc
where sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and sc.prerequisite_type_id = (select id from prerequisite_types where name = 'Test License Number')
order by sc.submitted_at;
```

**Expect:** **two** rows. `LIC-684-REVIEWME` is now `superseded` **with its `rejection_reason` still intact**, plus a new `pending` row. Nothing was overwritten.

4. Reopen the review sidebar in `/admin/approvals`.
5. **Expect:** the entry reads **Pending review** with a `Show earlier submissions (1)` toggle that reveals the old rejected row and its reason.

### 8h. Superseded rows can't be reviewed; decisions can be corrected

Take the `superseded` credential's id from the query in 8g and POST a review for it.

**Expect:** HTTP 409 `This submission was replaced by a newer one.` Confirm no Approve/Reject buttons render on that row in the earlier-submissions panel.

Then, on the **approved** `Test Waiver Signed`, click **Reject** with reason `Correcting an earlier mistake`.

**Expect:** it succeeds — staff can correct a decision without forcing a resubmission.

### 8i. The audit trail

1. Open `http://localhost:3000/admin/students/` and click into `Preq Journey`.
2. **Expect:** the activity log shows `prerequisite_approved` and `prerequisite_rejected` entries. (If these fail to write, migration 30 wasn't applied.)

### Pass criteria — BEN-684

- [ ] `/admin/approvals` is a working queue; the sidebar shows every class prerequisite with value, issued date, expiry, and status.
- [ ] Both new admin endpoints reject anonymous (401) and student (403) callers.
- [ ] Approve clears `rejection_reason`; reject requires a non-empty reason and stores it.
- [ ] A rejection email arrives and deep-links back to the right prerequisite step.
- [ ] Resubmission creates a **new** row; the rejected row and its reason survive and stay visible.
- [ ] Superseded rows return HTTP 409 and render no action buttons.
- [ ] An already-decided credential can be corrected to the other outcome.
- [ ] Review actions appear in the student's activity log.

---

## 9. BEN-685 — Staff views, access gating, and communications

> **Self-contained preconditions.** Branch `685-tiered-enrollment`. Admin and student login working, OTP email delivery working. `npm run dev` running. No Stripe needed. Uses class **`PREQ-685`** — deliberately seeded with a `class_start_date` **30 days out**, which the "expires before class starts" check depends on — and test student **`alexbensonux+preqjourney@gmail.com`**.

### 9a. Setup — run this first

**Migrations.** Print migrations 24–**30** in order and paste the output into the Supabase SQL editor:

```bash
cd /Users/alexbenson/Repos/midwestea
for n in 24 25 26 27 28 29 30; do
  echo "-- ===== $(ls supabase/migrations/${n}_*.sql) ====="
  cat supabase/migrations/${n}_*.sql
  echo
done
```

Each runs exactly once — an `already exists` error means it's already applied.

**Student account.** In the Supabase Dashboard → **Authentication → Users → Add user**, create `alexbensonux+preqjourney@gmail.com` and auto-confirm it.

**Seed data — catalog, class, and a student spanning five different statuses.** Idempotent; safe to re-run.

```sql
insert into courses (course_name, course_code, program_type, type, price, registration_fee)
select 'Prerequisite Test Program', 'PREQ', 'program', 'program', 400000, 20000
where not exists (select 1 from courses where course_code = 'PREQ');

insert into prerequisite_types (name, input_type, description, required_by_default, expiration_rule, expiration_duration_months)
select v.name, v.input_type, v.description, v.required_by_default, v.expiration_rule, v.months
from (values
  ('Test BLS Card',       'file_upload', 'Upload your current BLS provider card.',      true,  'duration_from_issue', 24),
  ('Test License Expiry', 'date',        'Enter the expiration date on your license.',  true,  'fixed_date',          null::int),
  ('Test License Number', 'text',        'Enter your state license number.',            true,  'none',                null::int),
  ('Test Waiver Signed',  'checkbox',    'Confirm you have read the liability waiver.', true,  'none',                null::int),
  ('Test Optional Note',  'text',        'Anything else we should know? Optional.',     false, 'none',                null::int)
) as v(name, input_type, description, required_by_default, expiration_rule, months)
where not exists (
  select 1 from prerequisite_types p
  where lower(btrim(p.name)) = lower(btrim(v.name)) and p.input_type = v.input_type
);

insert into template_prerequisites (course_uuid, prerequisite_type_id, is_required, sort_order)
select c.id, p.id, p.required_by_default, v.sort_order
from (values
  ('Test BLS Card', 0), ('Test License Expiry', 1), ('Test License Number', 2),
  ('Test Waiver Signed', 3), ('Test Optional Note', 4)
) as v(name, sort_order)
join prerequisite_types p on p.name = v.name
cross join (select id from courses where course_code = 'PREQ') c
on conflict (course_uuid, prerequisite_type_id) do nothing;

-- class_start_date is 30 days out on purpose: the BLS card below expires at +10 days,
-- which is what produces the "Expires before class starts" status.
insert into classes (
  course_uuid, class_name, course_code, class_id,
  enrollment_start, enrollment_close, class_start_date, class_close_date,
  price, registration_fee, wf_class_link
)
select c.id, 'Prereq Test Class (BEN-685)', 'PREQ', 'PREQ-685',
       current_date - 7, current_date + 60, (current_date + 30)::date, (current_date + 35)::date,
       400000, 20000, 'https://example.com/materials/preq-685'
from (select id from courses where course_code = 'PREQ') c
where not exists (select 1 from classes cl where cl.class_id = 'PREQ-685');

update classes set class_start_date = (current_date + 30)::date,
                   wf_class_link = 'https://example.com/materials/preq-685'
where class_id = 'PREQ-685';

insert into class_prerequisites (class_id, prerequisite_type_id, is_required, sort_order, source_course_uuid)
select cl.id, tp.prerequisite_type_id, tp.is_required, tp.sort_order, tp.course_uuid
from template_prerequisites tp
join courses co on co.id = tp.course_uuid and co.course_code = 'PREQ'
join classes cl on cl.class_id = 'PREQ-685'
on conflict (class_id, prerequisite_type_id) do nothing;

insert into students (id, first_name, last_name)
select u.id, 'Preq', 'Journey' from auth.users u
where u.email = 'alexbensonux+preqjourney@gmail.com'
on conflict (id) do nothing;

insert into enrollments (student_id, class_id, enrollment_status)
select s.id, cl.id, 'registered'
from students s
join auth.users u on u.id = s.id and u.email = 'alexbensonux+preqjourney@gmail.com'
cross join (select id from classes where class_id = 'PREQ-685') cl
where not exists (select 1 from enrollments e where e.student_id = s.id and e.class_id = cl.id);

-- ---------------------------------------------------------------------------
-- Journey student: normalize to FULLY APPROVED on all four required items.
-- (If you ran the BEN-684 section they'll already be close to this; these
--  statements are idempotent and force the exact state either way.)
-- ---------------------------------------------------------------------------
insert into student_credentials (student_id, prerequisite_type_id, submitted_for_class_id, value_text, review_status, reviewed_at, expires_at, submitted_at)
select u.id, p.id, cl.id, 'SEED-APPROVED', 'approved', now(), current_date + 400, now()
from auth.users u, prerequisite_types p, classes cl
where u.email = 'alexbensonux+preqjourney@gmail.com'
  and p.name in ('Test BLS Card','Test License Expiry','Test License Number','Test Waiver Signed')
  and cl.class_id = 'PREQ-685'
  and not exists (
    select 1 from student_credentials sc
    where sc.student_id = u.id and sc.prerequisite_type_id = p.id
  );

update student_credentials sc
set review_status = 'approved', rejection_reason = null,
    reviewed_at = now(), expires_at = current_date + 400
where sc.student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and sc.review_status in ('pending','rejected');
```

**Fixture students.** In the Supabase Dashboard → **Authentication → Users → Add user**, create `alexbensonux+preqfix1@gmail.com` and `alexbensonux+preqfix2@gmail.com` (auto-confirm both). These two exist only to give the staff matrix and follow-up list several students in *different* states at once — they are never driven through a UI flow.

```sql
insert into students (id, first_name, last_name)
select u.id, 'Preq', 'Fixture One' from auth.users u
where u.email = 'alexbensonux+preqfix1@gmail.com' on conflict (id) do nothing;

insert into students (id, first_name, last_name)
select u.id, 'Preq', 'Fixture Two' from auth.users u
where u.email = 'alexbensonux+preqfix2@gmail.com' on conflict (id) do nothing;

insert into enrollments (student_id, class_id, enrollment_status)
select s.id, cl.id, 'registered'
from students s
join auth.users u on u.id = s.id
cross join (select id from classes where class_id = 'PREQ-685') cl
where u.email in ('alexbensonux+preqfix1@gmail.com','alexbensonux+preqfix2@gmail.com')
  and not exists (select 1 from enrollments e where e.student_id = s.id and e.class_id = cl.id);

-- Fixture One: one REJECTED (with reason) + one PENDING. The other two stay NOT STARTED.
insert into student_credentials (student_id, prerequisite_type_id, submitted_for_class_id, value_date, review_status, rejection_reason, reviewed_at, submitted_at)
select u.id, p.id, cl.id, current_date + 200, 'rejected', 'Document was illegible', now(), now()
from auth.users u, prerequisite_types p, classes cl
where u.email = 'alexbensonux+preqfix1@gmail.com' and p.name = 'Test License Expiry' and cl.class_id = 'PREQ-685'
  and not exists (select 1 from student_credentials sc where sc.student_id = u.id and sc.prerequisite_type_id = p.id);

insert into student_credentials (student_id, prerequisite_type_id, submitted_for_class_id, value_boolean, review_status, submitted_at)
select u.id, p.id, cl.id, true, 'pending', now()
from auth.users u, prerequisite_types p, classes cl
where u.email = 'alexbensonux+preqfix1@gmail.com' and p.name = 'Test Waiver Signed' and cl.class_id = 'PREQ-685'
  and not exists (select 1 from student_credentials sc where sc.student_id = u.id and sc.prerequisite_type_id = p.id);

-- Fixture Two: approved BUT expires before the class starts.
-- PREQ-685 starts at +30 days; this credential dies at +10.
insert into student_credentials (student_id, prerequisite_type_id, submitted_for_class_id, file_url, review_status, issued_at, expires_at, reviewed_at, submitted_at)
select u.id, p.id, cl.id, u.id::text || '/' || p.id::text || '/bls-fixture.pdf', 'approved', current_date - 10, current_date + 10, now(), now()
from auth.users u, prerequisite_types p, classes cl
where u.email = 'alexbensonux+preqfix2@gmail.com' and p.name = 'Test BLS Card' and cl.class_id = 'PREQ-685'
  and not exists (select 1 from student_credentials sc where sc.student_id = u.id and sc.prerequisite_type_id = p.id);
```

**Confirm the spread before testing the staff views:**

```sql
select u.email, p.name, coalesce(sc.review_status, 'not started') as status, sc.expires_at
from enrollments e
join auth.users u on u.id = e.student_id
join classes cl on cl.id = e.class_id and cl.class_id = 'PREQ-685'
join class_prerequisites cp on cp.class_id = cl.id
join prerequisite_types p on p.id = cp.prerequisite_type_id
left join latest_student_credentials sc
  on sc.student_id = u.id and sc.prerequisite_type_id = cp.prerequisite_type_id
order by u.email, cp.sort_order;
```

**Expect:** three students on `PREQ-685`. The journey student is `approved` across all four required items; Fixture One has one `rejected`, one `pending`, and two `not started`; Fixture Two has one `approved` expiring at `+10 days` and the rest `not started`. Between them that covers **Approved**, **Pending review**, **Needs resubmission**, **Not started**, **Expires before class starts**, and **Optional**.

### 9b. Staff matrix

1. Sign in as an admin, open `http://localhost:3000/admin/classes/`, click into **Prereq Test Class (BEN-685)**.
2. Scroll below the Students table.
3. **Expect:** a `Prerequisite status by student` card — **three** rows (`Preq Journey`, `Preq Fixture One`, `Preq Fixture Two`), one column per prerequisite, each cell a status badge.
4. **Expect**, reading across all three rows: **Approved** (green) on `Preq Journey`; **Needs resubmission** (red) and **Pending review** (blue) on `Preq Fixture One`; **Expires before class starts** (amber) on `Preq Fixture Two`; **Not started** (gray) and **Optional** (gray) scattered across the fixtures.
5. **Expect** a summary strip reading `1 fully approved · ... awaiting review · ... with outstanding requirements`, with the three buckets mutually exclusive and totaling **3**.
6. Click the filter buttons **Outstanding**, **Pending review**, **Expiring**, then **All**.
7. **Expect:** `Outstanding` shows the two fixtures and hides `Preq Journey`; `Expiring` shows only `Preq Fixture Two`; `All` restores all three.
8. Click any cell in `Preq Fixture One`'s row.
9. **Expect:** the same review sidebar from `/admin/approvals` — not a second, different review UI.
10. Open the browser network tab and reload. **Expect:** **one** `class-matrix` request, not three.

### 9c. Cross-class follow-up list

1. Open `http://localhost:3000/admin/follow-up` (a `Follow-up` item should appear in the sidebar after `Approvals`).
2. **Expect:** one row per student × class × flagged prerequisite, soonest class first, with reasons drawn from `Not started`, `Rejected — needs resubmission`, `Expired`, `Expires before class starts`, `Expiring soon`.
3. **Expect:** `Preq Fixture One` appears for `Test License Expiry` (rejected) and for its two **not started** items — but **not** for `Test Waiver Signed`, which is `pending_review` and belongs to staff's own queue, not student outreach.
4. **Expect:** `Preq Fixture Two` appears for `Test BLS Card` with reason **Expires before class starts**.
5. **Expect:** `Preq Journey` does **not** appear at all — they're fully approved, so there's nothing to chase.
6. **Expect:** `Test Optional Note` generates **no** row for anyone — optional prerequisites never appear.
7. **Expect:** the class starting in 30 days is not highlighted; a class starting within 7 days would be.
8. Change the expiry window selector between `30 days` / `60 days` / `90 days`.
9. **Expect:** only `Expiring soon` rows change; the other reasons are unaffected.
10. Click **Export CSV**.
11. **Expect:** a file containing exactly the currently filtered rows.
12. **Expect:** there is **no** Remove, Refund, Withdraw, or Cancel control anywhere on this page.

### 9d. Access gating

"Class materials" here means the class's `wf_class_link` — the seed sets one on every `PREQ-*` class.

The journey student arrives here **fully approved**, so this test runs backwards: knock one credential out of approval to prove the lock engages, then restore it to prove the unlock is automatic.

1. Put one required credential back into review:

```sql
update student_credentials set review_status = 'pending', reviewed_at = null
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and prerequisite_type_id = (select id from prerequisite_types where name = 'Test Waiver Signed');
```

2. Sign in as `alexbensonux+preqjourney@gmail.com`, open `http://localhost:3000/student/profile`, expand **Prereq Test Class (BEN-685)**.
3. **Expect:** a locked block reading `Class materials unlock once your required prerequisites are approved.` naming `Test Waiver Signed` as the blocker.
4. **Expect** it to note that an item is still under review. **This is the important one** — a `pending_review` item does *not* unlock access. Submitting is not the same as being approved.

Grab the class UUID and the student's token, then hit the endpoint directly:

```sql
select id as class_uuid from classes where class_id = 'PREQ-685';
```

(For the student token: while signed in as the student, run this in the browser console — `JSON.parse(Object.entries(localStorage).find(([k])=>k.includes('auth-token'))[1]).access_token`)

```bash
curl -s "http://localhost:3000/api/classes/<CLASS_UUID>/materials" \
  -H "Authorization: Bearer <STUDENT_ACCESS_TOKEN>"
```

**Expect:** `"granted": false`, `"reason": "prerequisites_incomplete"`, and **`"materialsUrl": null`** — the URL must not appear in the payload at all while access is denied.

5. Approve it again:

```sql
update student_credentials set review_status = 'approved', reviewed_at = now(),
       rejection_reason = null, expires_at = current_date + 400
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and review_status in ('pending','rejected');
```

6. Reload the profile.
7. **Expect:** an **Open class materials** button — granted automatically, with no admin toggle or unlock step in between. Clicking it opens the class's `wf_class_link`.
8. Re-run the curl. **Expect:** `"granted": true` with a populated `materialsUrl`.

9. Now re-lock a different way — by **expiring** a credential rather than un-approving it:

```sql
update student_credentials set expires_at = current_date - 1
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and prerequisite_type_id = (select id from prerequisite_types where name = 'Test BLS Card');
```

10. Reload. **Expect:** access reverts to locked — the gate re-evaluates every time, nothing is cached.

11. **Optional items never block.** Restore the expiry and confirm access is granted **without** `Test Optional Note` ever being completed:

```sql
update student_credentials set expires_at = current_date + 400
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
  and prerequisite_type_id = (select id from prerequisite_types where name = 'Test BLS Card');
```

12. **A class with no materials link reads differently from a permission block:**

```sql
update classes set wf_class_link = null where class_id = 'PREQ-685';
```

**Expect:** `Materials aren't posted for this class yet.` — not a locked/permission message. Then restore:

```sql
update classes set wf_class_link = 'https://example.com/materials/preq-685' where class_id = 'PREQ-685';
```

### 9e. Emails branch on prerequisite state

The **pending-review** email fires at enrollment when a class has unmet required prerequisites; the **fully-enrolled** email fires on the transition when the **last** required prerequisite is approved.

1. With `Preq Journey` fully approved from step 9d, re-approve an already-approved credential through `/admin/approvals`.

```sql
select email_type, recipient_email, success, created_at
from email_logs
where recipient_email = 'alexbensonux+preqjourney@gmail.com'
order by created_at desc;
```

**Expect:** at most **one** `fully_enrolled` row — re-approving an already-complete class does not re-send. It's a transition email, deduped on enrollment.

2. Open the `fully_enrolled` email.
3. **Expect:** subject `You're fully enrolled in Prereq Test Class (BEN-685)`, a **Go to my portal** button pointing at `/student/profile`, and **no** `wf_class_link` value embedded anywhere — materials always route through the gate.
4. **Expect:** no tier language and no course-type branching in either new email.

To see the pending-review variant, run the §7 (BEN-686) registration flow — it fires on a fresh paid enrollment with unmet prerequisites, alongside (not instead of) the existing receipt email.

### 9f. Payment and prerequisite state stay independent

```sql
-- Snapshot payment state
select id, transaction_status, amount_paid, amount_due, refund_amount, refund_percentage
from transactions
where enrollment_id = (
  select e.id from enrollments e
  join auth.users u on u.id = e.student_id
  where u.email = 'alexbensonux+preqjourney@gmail.com'
  limit 1
) order by id;
```

Run a full review cycle on `Preq Journey` — reject something, have the student resubmit, approve it — then re-run the snapshot query.

**Expect:** a **byte-identical** result set. Prerequisite review never touches payment state.

```sql
-- And the reverse: onboarding_complete was NOT repurposed as a prerequisite flag
select onboarding_complete from enrollments e
join auth.users u on u.id = e.student_id
where u.email = 'alexbensonux+preqjourney@gmail.com';
```

**Expect:** unchanged across the whole review cycle.

Also confirm both states are visible **together**: on `/student/profile` a `Payment: <status>` line sits beside the requirements summary, and on `/admin/classes/<PREQ-685>` the `Invoice Status` and `Prerequisites` columns appear side by side.

### 9g. Removal and refunds stay manual

1. On `/admin/classes/` → **Prereq Test Class (BEN-685)**, open the **Remove** modal for `Preq Journey`.
2. **Expect:** read-only prerequisite context plus the disclaimer `Requirement status is shown for context only. It does not affect removal or refund.`
3. **Expect:** the refund-percentage field behaves exactly as before — the prerequisite block never prefills or changes it.
4. Snapshot the student's credentials, remove the student with a 50% refund, then re-check:

```sql
select id, review_status, expires_at from student_credentials
where student_id = (select id from auth.users where email = 'alexbensonux+preqjourney@gmail.com')
order by id;
```

**Expect:** identical before and after. Removing a student never deletes or voids their credentials — an approved card must still satisfy a future class.

5. Restore the enrollment via the admin UI.
6. **Expect:** prerequisite statuses return with no re-submission and no repair step, because evaluation is derived rather than cached.

### Pass criteria — BEN-685

- [ ] The staff matrix shows all statuses per student, with working filters and one request per load.
- [ ] `/admin/follow-up` lists outreach rows, excludes `pending_review` and optional items, and exposes no removal/refund controls.
- [ ] Materials stay locked while anything required is unapproved — including merely submitted — and unlock automatically on approval.
- [ ] `materialsUrl` is `null` in every denied API response.
- [ ] Expiring a credential re-locks access; a missing `wf_class_link` reads as "not posted", not as a permission block.
- [ ] `fully_enrolled` fires once on the transition and never embeds the materials URL.
- [ ] A full review cycle leaves `transactions` and `onboarding_complete` byte-identical.
- [ ] Removing a student preserves their credentials; restoring recovers status automatically.

---

## 10. Separation guardrail — the one real command-line check

> **Self-contained preconditions.** Branch `685-tiered-enrollment`. No database, network, or running server needed — this is a static source check.

```bash
cd /Users/alexbenson/Repos/midwestea/apps/webapp && npm run verify:separation
```

**Expect exactly:**

```
Verified prerequisite separation from payment and removal workflows across 17 files.
```

Exit code 0. This statically enforces three rules: prerequisite code never reads payment state; payment code never reads prerequisite state; and prerequisite code never **writes** `enrollment_status` / `transaction_status` / `refund_*` (bare reads are allowed, since several modules legitimately read `enrollment_status` to exclude removed students).

### Confirm the guard actually guards

Temporarily add `const x = 'transaction';` to `apps/webapp/lib/class-access.ts` and re-run.

**Expect:** exit code 1, naming that file and the term. Revert.

Then add `// this mentions transaction` as a **comment** in the same file and re-run.

**Expect:** exit code 0 — comments are stripped before matching. Revert.

Run this after every merge in the stack to catch drift.

---

## 11. Full-chain smoke test

> **Self-contained preconditions.** Branch `685-tiered-enrollment`. `npm run dev` and `stripe listen --forward-to localhost:3000/api/webhooks/stripe` both running. Stripe test mode. Admin login and OTP delivery working. Uses a **fresh** email, `alexbensonux+preqfull@gmail.com`, and builds its own class through the UI so nothing pre-seeded can mask a gap.

### Setup — run this first

**Migrations.** Print migrations 24–30 in order and paste the output into the Supabase SQL editor:

```bash
cd /Users/alexbenson/Repos/midwestea
for n in 24 25 26 27 28 29 30; do
  echo "-- ===== $(ls supabase/migrations/${n}_*.sql) ====="
  cat supabase/migrations/${n}_*.sql
  echo
done
```

**Seed the program plus one extra class** for the cross-class reuse check in step 17. Idempotent.

```sql
insert into courses (course_name, course_code, program_type, type, price, registration_fee)
select 'Prerequisite Test Program', 'PREQ', 'program', 'program', 400000, 20000
where not exists (select 1 from courses where course_code = 'PREQ');

-- Second class, used only to prove an approved credential carries across classes
insert into classes (
  course_uuid, class_name, course_code, class_id,
  enrollment_start, enrollment_close, class_start_date, class_close_date,
  price, registration_fee, wf_class_link
)
select c.id, 'Prereq Smoke Reuse Class', 'PREQ', 'PREQ-REUSE',
       current_date - 7, current_date + 60, (current_date + 90)::date, (current_date + 95)::date,
       400000, 20000, 'https://example.com/materials/preq-reuse'
from (select id from courses where course_code = 'PREQ') c
where not exists (select 1 from classes cl where cl.class_id = 'PREQ-REUSE');
```

> If the `courses` insert errors on the `type` column, drop `type` from both the column list and the `select` and re-run.

Step 4 below creates the prerequisite type and template assignment through the UI, and step 3 creates the primary class — that's deliberate, since exercising those paths is part of the test.

One pass across all five L1s:

1. **(BEN-687)** `/admin/prerequisites` → create a new type `Smoke Test Cert`, input type **File upload**, expiration **24 months**, required.
2. **(BEN-687)** `/admin/programs` → **Prerequisite Test Program** → add `Smoke Test Cert` to the template.
3. **(BEN-687)** Same page → **Add Class** → create a class. Note its generated code.
4. **(BEN-687)** Open the new class → confirm the snapshot copied the template list including `Smoke Test Cert`.
5. Attach a Stripe test payment link to the new class and open its enrollment window:

```sql
update classes set stripe_payment_link = 'https://buy.stripe.com/test_YOUR_LINK_HERE',
       enrollment_start = current_date - 7, enrollment_close = current_date + 60
where class_id = '<NEW_CLASS_CODE>';
```

6. **(BEN-686)** `/checkout/details?classID=<NEW_CLASS_CODE>` → register as `alexbensonux+preqfull@gmail.com` → pay with `4242 4242 4242 4242`.
7. **(BEN-686)** Follow **Continue to class requirements** → OTP sign-in → land on the prerequisites wizard.
8. **(BEN-685)** Check the inbox for the **pending-review** email alongside the enrollment receipt.
9. **(BEN-686)** Submit every required prerequisite.
10. **(BEN-685)** `/student/profile` → confirm materials are **locked** while everything sits in review.
11. **(BEN-684)** As admin, `/admin/approvals` → reject one with a reason.
12. **(BEN-684)** Confirm the rejection email arrives and deep-links back to the right step.
13. **(BEN-684)** As the student, resubmit; confirm in SQL that the rejected row survives as `superseded`.
14. **(BEN-684)** As admin, approve everything.
15. **(BEN-685)** Confirm the **fully-enrolled** email arrives, and that `/student/profile` now offers **Open class materials**.
16. **(BEN-685)** `/admin/classes/<new class>` → confirm the matrix shows the student fully approved and materials **Unlocked**.
17. **(BEN-683)** Confirm cross-class reuse. Put the same prerequisites onto the second class (`PREQ-REUSE`, created in this section's setup), then evaluate the same student against it:

```sql
-- Give PREQ-REUSE the same prerequisite list the student just satisfied elsewhere
insert into class_prerequisites (class_id, prerequisite_type_id, is_required, sort_order, source_course_uuid)
select cl.id, tp.prerequisite_type_id, tp.is_required, tp.sort_order, tp.course_uuid
from template_prerequisites tp
join courses co on co.id = tp.course_uuid and co.course_code = 'PREQ'
join classes cl on cl.class_id = 'PREQ-REUSE'
on conflict (class_id, prerequisite_type_id) do nothing;

-- Now evaluate the student against a class they have never enrolled in or submitted to
select p.name, cp.is_required, sc.review_status
from class_prerequisites cp
join prerequisite_types p on p.id = cp.prerequisite_type_id
left join latest_student_credentials sc
  on sc.prerequisite_type_id = cp.prerequisite_type_id
 and sc.student_id = (select id from auth.users where email = 'alexbensonux+preqfull@gmail.com')
where cp.class_id = (select id from classes where class_id = 'PREQ-REUSE')
order by cp.sort_order;
```

**Expect:** every prerequisite this student already had approved shows `approved` against `PREQ-REUSE` too, with no resubmission and no enrollment — the whole point of student-owned credentials.

18. **(BEN-685)** `cd apps/webapp && npm run verify:separation` → expect the success line and exit 0.

---

## 12. Cleanup

Everything this guide creates is namespaced — `PREQ%` codes, `Test %` / `Smoke Test %` prerequisite names, and `+preq*` email aliases — so it removes cleanly:

```sql
delete from student_credentials
where student_id in (select id from auth.users where email like 'alexbensonux+preq%@gmail.com');

delete from transactions
where enrollment_id in (
  select e.id from enrollments e join auth.users u on u.id = e.student_id
  where u.email like 'alexbensonux+preq%@gmail.com'
);

delete from enrollments
where student_id in (select id from auth.users where email like 'alexbensonux+preq%@gmail.com');

delete from class_prerequisites
where class_id in (select id from classes where course_code = 'PREQ');

delete from classes where course_code = 'PREQ';

delete from template_prerequisites
where course_uuid in (select id from courses where course_code = 'PREQ');

delete from courses where course_code = 'PREQ';

delete from prerequisite_types where name like 'Test %' or name like 'Smoke Test %';

delete from students
where id in (select id from auth.users where email like 'alexbensonux+preq%@gmail.com');
```

Then delete the `+preq*` users in Supabase Dashboard → **Authentication → Users**, and empty the `student-credentials` storage bucket of any test uploads.

Stop `stripe listen` and `npm run dev`, and restore your real `.env.local` if you pointed it at the sandbox. Since prerequisites are additive — seven new migrations, no changes to existing tables beyond the `logs_action_type_check` constraint in migration 30 — the sandbox project can simply be trashed once you're satisfied.
