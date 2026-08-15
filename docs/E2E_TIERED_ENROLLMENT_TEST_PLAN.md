# Tiered Enrollment — End-to-End Test Plan

Covers [BEN-687](https://linear.app/midwestern/issue/BEN-687/manage-prerequisite-catalog-and-template-assignment), [BEN-683](https://linear.app/midwestern/issue/BEN-683/store-class-prerequisites-and-student-credential-records), [BEN-686](https://linear.app/midwestern/issue/BEN-686/collect-class-prerequisites-after-payment-and-from-the-student-profile), [BEN-684](https://linear.app/midwestern/issue/BEN-684/review-student-credentials-and-handle-re-submission), and [BEN-685](https://linear.app/midwestern/issue/BEN-685/surface-prerequisite-status-access-gating-and-communications) — the full prerequisite lifecycle, built across five stacked branches. Goal: walk each one from **Ready to Review → Done** by actually exercising it locally, in order, against an isolated Stripe test sandbox and an isolated Supabase project. Nothing here gets pushed; everything runs on `localhost`.

No code changes. This is a test pass only.

#### The shape of the work

Each L1 lives on its own branch, stacked on the previous one. `683-tiered-enrollment` contains everything in `687-tiered-enrollment` plus its own commits, and so on down the chain. `685-tiered-enrollment` has all of it. Since you're testing in order against one database, state accumulates naturally — you don't reset anything between sections.

| Issue | Branch | Depends on | Builds | New migrations |
| -- | -- | -- | -- | -- |
| [BEN-687](https://linear.app/midwestern/issue/BEN-687) | `687-tiered-enrollment` | — | Prerequisite catalog + template assignment + class snapshots | `24`, `25`, `26`, `27` |
| [BEN-683](https://linear.app/midwestern/issue/BEN-683) | `683-tiered-enrollment` | 687 | Student credential records + evaluation + expiry | `28`, `29` |
| [BEN-686](https://linear.app/midwestern/issue/BEN-686) | `686-tiered-enrollment` | 683 | Post-payment wizard + profile completion path | none |
| [BEN-684](https://linear.app/midwestern/issue/BEN-684) | `684-tiered-enrollment` | 686 | Staff review, approve/reject, resubmission history | `30` |
| [BEN-685](https://linear.app/midwestern/issue/BEN-685) | `685-tiered-enrollment` | 684 | Staff visibility, material gating, enrollment emails, separation guardrails | none |

Verified stacking: `git merge-base --is-ancestor` passes for every adjacent pair as of this writing.

#### Facts worth knowing before you start

* **Three tables, three lifetimes.** `prerequisite_types` is the global catalog (edit freely, affects nothing retroactively). `template_prerequisites` hangs off `courses` and is the editable list on a program or course template. `class_prerequisites` is a **snapshot** copied onto a class at creation time and never rewritten — editing a template does not touch classes that already exist, and there is deliberately no backfill for classes created before migration `27`.
* **`courses` holds both programs and course templates.** `program_type = 'program'` means it renders at `/admin/programs/<uuid>`; anything else renders at `/admin/courses/<uuid>`. One table, one `template_prerequisites` relation, two surfaces.
* **Route segments are not interchangeable.** `/student/prerequisites/<CLASS CODE>` takes the human class code (`PARA-002`). `/api/prerequisites/evaluate?classId=<CLASS UUID>` and `/api/classes/<CLASS UUID>/materials` take the `classes.id` UUID. `/admin/classes/<CLASS UUID>` takes the UUID. Mixing these up produces an empty page rather than an error, so the ledger in §1.9 tracks both.
* **Credentials are student-owned, not enrollment-owned.** One approved `student_credentials` row for a prerequisite type satisfies *every* class requiring that type. `submitted_for_class_id` is review context only — it does not scope who the credential satisfies.
* **History is never overwritten.** Resubmitting inserts a new row and marks the prior one `superseded`. The `latest_student_credentials` view is the single shared definition of "the current credential". Any consumer that re-derives it instead is a bug.
* **Expiry is computed at write time and stored**, by `compute_credential_expiry(issued, rule, months)` in Postgres. Changing a type's `expiration_duration_months` afterward must not move an existing credential's `expires_at`.
* **The seven statuses** are `satisfied` → **Approved**, `pending_review` → **Pending review**, `rejected` → **Needs resubmission**, `missing` → **Not started**, `expired` → **Expired**, `expiring_before_class` → **Expires before class starts**, `not_required` → **Optional**. There is exactly one badge component (`PrerequisiteStatusBadge`) and one evaluator, so staff and student views must always agree for the same student and class.
* **Submission does not unlock; approval does.** Class-material access (`classes.wf_class_link`) is gated on *all required items being* `satisfied`. An item in `pending_review` still blocks.
* **Prerequisite state and payment state are deliberately independent.** Neither reads the other, and prerequisite code may never write `enrollment_status`, `transaction_status`, or `refund_*`. This is enforced statically by `npm run verify:separation`, tested in §6.6.
* **Auth is email OTP** (6-digit code) for both `/admin/login` and `/student/login` — no passwords. Admin login additionally checks the email against the `admins` table before it will even send a code.
* **Registration payment goes through a Stripe Payment Link stored on the class row** (`classes.stripe_payment_link`), not a Checkout Session built by this repo. Its return URL is configured **in Stripe, on the link itself** — §1.5 sets that up.
* **Migration `30` exists in two versions.** The one committed on `684-tiered-enrollment` drops `webflow_synced` from `logs_action_type_check`; the corrected one on `685-tiered-enrollment` restores it. Run the corrected version — §5.1 gives it inline.

---

## 1. Set up the testing environment

Nine steps. At the end of this section you can check out `687-tiered-enrollment` and start testing without any further decisions.

Both a Stripe test sandbox and an isolated Supabase project are required for this pass. Stripe, because [BEN-686](https://linear.app/midwestern/issue/BEN-686) routes students out of a completed registration-fee payment and [BEN-685](https://linear.app/midwestern/issue/BEN-685) sends an email off the `checkout.session.completed` webhook — neither can be exercised without a real test payment. Supabase, because nearly every check below writes rows: catalog types, template assignments, class snapshots, credentials, reviews, logs, email logs.

### 1.1 Install tooling and back up your environment file

```bash
brew install stripe/stripe-cli/stripe
brew install jq
stripe login
```

`stripe login` opens a browser to authorize the CLI. Expect `Done! The Stripe CLI is configured` on return.

Back up the real environment file. This exact path is what §7.2 restores from:

```bash
cp apps/webapp/.env.local apps/webapp/.env.local.backup
ls -la apps/webapp/.env.local.backup
```

Expect a file of the same size as `apps/webapp/.env.local`.

Confirm the branches are all present locally:

```bash
git branch --list '68*-tiered-enrollment'
```

Expect five lines: `683-`, `684-`, `685-`, `686-`, `687-tiered-enrollment`.

Leave the Supabase dashboard open in a browser tab. No Supabase CLI is needed for any of this.

**Acceptance criteria:**

- [ ] `stripe login` reports the CLI is configured.
- [ ] `apps/webapp/.env.local.backup` exists and matches the size of `apps/webapp/.env.local`.
- [ ] All five `68*-tiered-enrollment` branches are listed locally.

### 1.2 Create the isolated Supabase test project and clone live data into it

`apps/webapp/.env.local` currently points `NEXT_PUBLIC_SUPABASE_URL` at the live project. Testing against it would write fake students, credentials, and email logs alongside real data. So: a separate Supabase project, cloned from current schema + data, used only from local `npm run dev`.

1. **Create a new Supabase project** in the dashboard — name it `midwestea-prereq-test`. Free tier is fine. From Settings → API, copy the Project URL, the `anon` key, and the `service_role` key.

2. **Repoint the `MIGRATION_*` vars at the new empty project.** These are the migration tooling's "target"; the unprefixed vars stay as they are and act as the read-only "source". Edit `apps/webapp/.env.local`:

   ```
   MIGRATION_NEXT_PUBLIC_SUPABASE_URL=<new project URL>
   MIGRATION_NEXT_PUBLIC_SUPABASE_ANON_KEY=<new project anon key>
   MIGRATION_SUPABASE_SERVICE_ROLE_KEY=<new project service_role key>
   ```

3. **Confirm the two projects are different and both reachable:**

   ```bash
   npm run migration:check-env
   ```

   Expect `✅ Ready for migration scripts.` If it reports source and target are the same ref, the edit in step 2 did not take.

4. **Generate the schema + data snapshot.** Read-only against the live project; writes local files only.

   ```bash
   npm run migration:generate-sql
   ```

   Expect numbered files under `docs/migration/generated-sql/` — `00-setup-enums.sql` through `13-email_logs.sql` — plus a `README.md` with the authoritative run order.

   > **This copies real student names, emails, and payment history into the new project.** Same Supabase org you already control, so it's a judgment call rather than a blocker — but it is real PII. Make that call deliberately.

5. **Run each file in the printed order** in the new project's SQL Editor (Supabase Dashboard → SQL Editor → paste → Run), `00-setup-enums.sql` first through `13-email_logs.sql` last. They are wrapped in `BEGIN`/`COMMIT` and use `ON CONFLICT (id) DO NOTHING`, so re-running one after a partial failure is safe.

   After the last file, in the new project's SQL Editor:

   ```sql
   select
     (select count(*) from courses)   as courses,
     (select count(*) from classes)   as classes,
     (select count(*) from students)  as students,
     (select count(*) from admins)    as admins;
   ```

   Expect four non-zero counts. Note the `classes` count — §1.7 picks from it.

**Acceptance criteria:**

- [ ] `npm run migration:check-env` prints `✅ Ready for migration scripts.`
- [ ] `docs/migration/generated-sql/` contains `00-setup-enums.sql` through `13-email_logs.sql` plus a `README.md`.
- [ ] All numbered files ran without error against the new project.
- [ ] The row-count query returns four non-zero counts.

### 1.3 Point the app at the test project and confirm the swap

`npm run dev` reads the **unprefixed** vars, not `MIGRATION_*`. This step is what actually redirects the app.

In `apps/webapp/.env.local`, set all five to the new project:

```
NEXT_PUBLIC_SUPABASE_URL=<new project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<new project anon key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<new project anon key>
SUPABASE_SERVICE_ROLE_KEY=<new project service_role key>
SUPABASE_URL=<new project URL>
```

Also confirm these are present and correct — the rejection, pending-review, and fully-enrolled emails all deep-link with `NEXT_PUBLIC_BASE_URL`, and `lib/email.ts` throws outright without `RESEND_API_KEY`:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
RESEND_API_KEY=re_...
```

Confirm the swap took:

```bash
grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_URL)=' apps/webapp/.env.local
```

Expect both lines to show the **new** project ref, not the live one. Record that ref in the ledger (§1.9) as `TEST_PROJECT_REF` — every SQL block in this document runs in *that* project's SQL Editor, and nothing in this document is ever run against production.

Verify connectivity from the terminal:

```bash
npm run test:supabase
```

Expect a successful connection reported against the new project URL.

**Acceptance criteria:**

- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL` in `.env.local` both show the new project ref.
- [ ] `npm run test:supabase` reports a successful connection to the new project.
- [ ] `TEST_PROJECT_REF` is recorded in the ledger (§1.9).

### 1.4 Set up the Stripe test sandbox and the registration payment link

1. In the [Stripe Dashboard](https://dashboard.stripe.com), toggle to **Test mode** (top right).
2. Developers → API keys → copy the test **Secret key** (`sk_test_…`) and **Publishable key** (`pk_test_…`).
3. Add all three Stripe vars to `apps/webapp/.env.local`. **These are not currently in the file at all** — the app cannot process a payment until they are:

   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=<from stripe listen, filled in at §1.8>
   ```
4. **Create the test Payment Link.** Product catalog → new Product, one Price, one-time, `$100.00` — this stands in for a Program registration fee. Then Payment links → create a link for that Price. In the link's **After payment** settings choose **Redirect customers to your website** and set the URL to:

   ```
   http://localhost:3000/checkout/success
   ```

   This return URL lives in Stripe, per link — not in this repo. If it is wrong, §4 will complete a payment and then strand the student on a Stripe confirmation page instead of routing them into the wizard.
5. Copy the payment link URL (`https://buy.stripe.com/test_…`) into the ledger as `STRIPE_PAYMENT_LINK_URL`. §4.1 writes it onto the test class.

**Acceptance criteria:**

- [ ] Stripe Dashboard is in Test mode; test Secret and Publishable keys are in `.env.local`.
- [ ] A test Product/Price/Payment Link exists for the $100 registration fee.
- [ ] The Payment Link's After-payment redirect points at `http://localhost:3000/checkout/success`.
- [ ] `STRIPE_PAYMENT_LINK_URL` is recorded in the ledger.

### 1.5 Apply migrations 24–27

These four are [BEN-687](https://linear.app/midwestern/issue/BEN-687)'s and are needed from the very first check. Migrations `28`–`30` come later, at the branch that introduces them.

Run each block, in order, in the **test project's** SQL Editor. Each is the full contents of the corresponding file under `supabase/migrations/`; open the file if you want the commentary.

**`24_create_prerequisite_types.sql`** — creates the catalog table, the normalized-uniqueness index, and RLS.

**`25_add_prerequisite_type_details.sql`** — adds `description`, `required_by_default`, `expiration_rule`, `expiration_duration_months`, and the CHECK constraint that keeps rule and duration in agreement.

**`26_create_template_prerequisites.sql`** — creates the program/course-template assignment table.

**`27_create_class_prerequisites.sql`** — creates the per-class snapshot table.

Run all four from the files rather than retyping them. Then confirm:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('prerequisite_types','template_prerequisites','class_prerequisites')
order by table_name;
```

Expect exactly three rows: `class_prerequisites`, `prerequisite_types`, `template_prerequisites`.

```sql
select conname from pg_constraint
where conrelid = 'prerequisite_types'::regclass
  and conname = 'prerequisite_types_expiration_rule_check';
```

Expect one row. If this is missing, migration `25` did not run and every catalog validation check in §2.3 will silently pass when it should fail.

**Acceptance criteria:**

- [ ] The three-table query returns exactly `class_prerequisites`, `prerequisite_types`, `template_prerequisites`.
- [ ] `prerequisite_types_expiration_rule_check` exists on `prerequisite_types`.

### 1.6 Confirm your admin account and create the two test students

**Admin.** The cloned `admins` table carries real rows over. Confirm yours is there:

```sql
select id, email, display_name from admins
where email = 'alex@midwesternoriginals.com' and deleted_at is null;
```

Expect one row. Record its `id` in the ledger as `ADMIN_UUID`.

If it returns nothing, create the auth user first (Dashboard → Authentication → Users → Add user, email `alex@midwesternoriginals.com`, auto-confirm), then:

```sql
insert into admins (id, display_name, email)
values ('<the auth user id you just created>', 'Alex Benson', 'alex@midwesternoriginals.com');
```

**Students.** Two, with distinct roles that run the whole length of this document:

| | Email | Role in this pass |
| -- | -- | -- |
| **Student A** | `alexbensonux+preqA@gmail.com` | The throughline. Carries a portable approved credential from §3, registers and walks the wizard in §4, gets rejected and resubmits in §5, reaches fully-enrolled and unlocks materials in §6. |
| **Student B** | `alexbensonux+preqB@gmail.com` | The contrast. Registers with no prior credentials in §4 and skips everything, so §6's staff matrix and follow-up list have a genuinely outstanding row to show beside Student A's approved one. |

Gmail `+` aliasing works for OTP delivery on both.

Create both now so §3 can work at the API level before any registration UI exists. Dashboard → Authentication → Users → **Add user**, for each address, with **Auto Confirm User** checked. Then:

```sql
insert into students (id, email, full_name)
values
  ('<auth uuid for +preqA>', 'alexbensonux+preqA@gmail.com', 'Prereq Student A'),
  ('<auth uuid for +preqB>', 'alexbensonux+preqB@gmail.com', 'Prereq Student B')
on conflict (id) do nothing;

select id, email, full_name from students
where email in ('alexbensonux+preqA@gmail.com','alexbensonux+preqB@gmail.com');
```

Expect two rows. Record the ids as `STUDENT_A_UUID` and `STUDENT_B_UUID`.

If that INSERT fails on a NOT NULL column, check `docs/migration/generated-sql/05-students.sql` from §1.2 for the live column list — the committed `schemas/*.json` snapshots in this repo are stale and should not be trusted over the generated file.

**OTP delivery on a new project.** OTP codes go through Supabase Auth's own mailer, and a brand-new project's default mailer is heavily rate-limited. Either read each code from Dashboard → Authentication → Logs as it is issued, or configure custom SMTP (Authentication → Settings → SMTP) with the Resend key already in `.env.local`. Decide now; you will log in as three different identities across this pass.

**Acceptance criteria:**

- [ ] `alex@midwesternoriginals.com` returns one row from `admins`; `ADMIN_UUID` recorded.
- [ ] Both `+preqA` and `+preqB` students exist in `students`; `STUDENT_A_UUID`/`STUDENT_B_UUID` recorded.
- [ ] A working method to read OTP codes on the test project is confirmed.

### 1.7 Pick the program and course templates

Rather than fabricating templates and guessing at NOT NULL columns, reuse real ones from the cloned data.

```sql
select id, course_code, course_name, program_type
from courses
where program_type = 'program'
order by course_name
limit 10;
```

Pick one. Record its `id` as `PROGRAM_UUID` and its `course_name` as `PROGRAM_NAME`. This is the template that §2.4 attaches prerequisites to and §2.6 creates classes from.

```sql
select id, course_code, course_name, program_type
from courses
where program_type is distinct from 'program'
order by course_name
limit 10;
```

Pick one. Record its `id` as `COURSE_UUID`. §2.5 gives this one its own, different prerequisite list to prove the two surfaces are independent.

Confirm neither already has assignments (they shouldn't — the tables were just created):

```sql
select course_uuid, count(*) from template_prerequisites
group by course_uuid;
```

Expect zero rows.

Finally, note a **pre-migration class** — one created before migration `27`, so it has no snapshot. Any existing class qualifies:

```sql
select id, class_id, class_name, class_start_date, wf_class_link
from classes
order by class_start_date desc
limit 5;
```

Pick one and record it as `LEGACY_CLASS_UUID` / `LEGACY_CLASS_CODE`. §2.7 and §4.6 use it to confirm classes without a snapshot degrade gracefully rather than erroring.

**Acceptance criteria:**

- [ ] `PROGRAM_UUID`/`PROGRAM_NAME` and `COURSE_UUID` are recorded, neither with existing `template_prerequisites` rows.
- [ ] `LEGACY_CLASS_UUID`/`LEGACY_CLASS_CODE` is recorded from an existing class.

### 1.8 Start everything and smoke-test

```bash
npm install
npm run dev
```

Expect `Ready` on `http://localhost:3000`.

In a second terminal, start the webhook forwarder. Leave it running for the entire pass:

```bash
stripe listen --events checkout.session.completed,invoice.paid,payout.paid --forward-to localhost:3000/api/webhooks/stripe
```

Expect `Ready! You are using Stripe API Version […]. Your webhook signing secret is whsec_…`.

Copy that `whsec_…` into `STRIPE_WEBHOOK_SECRET` in `apps/webapp/.env.local`, then restart `npm run dev`.

Event types are listed explicitly because the prerequisite work rides on `checkout.session.completed` (that is where the pending-review email in §6.5 fires) and the surrounding invoicing work rides on `invoice.paid`. A bare `stripe listen` sometimes forwards a narrower set.

**Smoke test — prove the app is on the test project, not production.** Open `http://localhost:3000/admin/login`, request an OTP for `alex@midwesternoriginals.com`, read the code from Authentication → Logs on the **test** project, and log in. If the code appears in the test project's logs, the app is talking to the right database. Then check `/admin/students` shows the cloned student list.

While you are logged in, grab an admin bearer token — you will reuse it in §5 and §6:

1. DevTools → Application → Local Storage → `http://localhost:3000` → find the key starting `sb-` and ending `-auth-token`.
2. Copy its `access_token` value.
3. In a terminal:

   ```bash
   export ADMIN_TOKEN="<paste the access_token>"
   export BASE_URL="http://localhost:3000"
   curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/admin/prerequisites/queue" | jq
   ```

   Expect `{"success": true, ...}`. A `403 Admin access required` means the token is a student's or the email is not in `admins`; a `401` means it is expired — Supabase access tokens are short-lived, so re-grab it whenever a call starts returning 401.

**Acceptance criteria:**

- [ ] `npm run dev` reports `Ready`; `stripe listen` reports a `whsec_…` secret, copied into `.env.local`.
- [ ] Admin OTP login succeeds and reads its code from the test project's Auth Logs.
- [ ] `/admin/students` shows the cloned student list.
- [ ] `ADMIN_TOKEN` is captured and `/api/admin/prerequisites/queue` returns `success: true`.

### 1.9 The value ledger

Everything below references these by name. Fill each in as the step that produces it runs — never leave a `<placeholder>` in a command you actually execute.

Keep this block in the terminal you run `curl` from, and re-export `ADMIN_TOKEN` / `STUDENT_A_TOKEN` whenever they expire:

```bash
export BASE_URL="http://localhost:3000"
export ADMIN_TOKEN=""            # §1.8 — expires, re-grab as needed
export STUDENT_A_TOKEN=""        # §3.2 — expires, re-grab as needed
export STUDENT_B_TOKEN=""        # §4.2
export CLASS_A_UUID=""           # §2.6
export CLASS_A_CODE=""           # §2.6
export STUDENT_A_UUID=""         # §1.6
export STUDENT_B_UUID=""         # §1.6
export CPR_TYPE_ID=""            # §2.2
```

| Value | Produced in | Consumed in |
| -- | -- | -- |
| `TEST_PROJECT_REF` | §1.3 | every SQL block in this document |
| `STRIPE_PAYMENT_LINK_URL` | §1.4 | §4.1 |
| `ADMIN_UUID` | §1.6 | §5.3 |
| `STUDENT_A_UUID` | §1.6 | §3, §4, §5, §6 |
| `STUDENT_B_UUID` | §1.6 | §4.2, §6.2, §6.3 |
| `PROGRAM_UUID` / `PROGRAM_NAME` | §1.7 | §2.4, §2.6, §2.7 |
| `COURSE_UUID` | §1.7 | §2.5 |
| `LEGACY_CLASS_UUID` / `LEGACY_CLASS_CODE` | §1.7 | §2.7, §4.6 |
| `ADMIN_TOKEN` | §1.8 | §5, §6 |
| `CPR_TYPE_ID` … `CONTACT_TYPE_ID` (5 ids) | §2.2 | §2.4, §3, §5, §6 |
| `CLASS_A_UUID` / `CLASS_A_CODE` | §2.6 | §3–§6 |
| `CLASS_B_UUID` | §2.7 | §2.7 only |
| `STUDENT_A_TOKEN` | §3.2 | §3, §4, §6 |
| `CPR_CREDENTIAL_ID` | §3.3 | §3.4, §3.5, §5 |
| `ENROLLMENT_A_UUID` | §4.2 | §6.5, §6.6 |

**Acceptance criteria:**

- [ ] The `export` block and the table above are both filled in with real values as each producing step completes — no row is left blank once its producing step has run.

---

## 2. [BEN-687](https://linear.app/midwestern/issue/BEN-687/manage-prerequisite-catalog-and-template-assignment) — Manage prerequisite catalog and template assignment

**Outcome to prove:** you can manage reusable prerequisites from settings, assign them to templates, and create future classes that inherit a stable copied prerequisite set.

**Branch:**

```bash
git checkout 687-tiered-enrollment
```

**Migrations:** `24`–`27`, already applied in §1.5.

**Inherits:** the test project with cloned data (§1.2), `PROGRAM_UUID` and `COURSE_UUID` (§1.7), an admin login (§1.8).

**Leaves behind:** a seeded catalog of five prerequisite types, a program template carrying four of them, and a class (`CLASS_A_CODE`) with a frozen snapshot. Everything from §3 onward runs against that class.

### 2.1 Confirm the prerequisites surfaces exist

Restart `npm run dev` after the checkout so the new routes compile.

1. Open `http://localhost:3000/admin/prerequisites`. Expect the new catalog page, reachable from **Prerequisites** in the admin sidebar, positioned after **Instructors**.
2. Open `http://localhost:3000/admin/programs/<PROGRAM_UUID>`. Expect a **Prerequisites** card between the **Program Details** card and the classes table, with the helper copy:

   > Classes created from this program will copy this list. Existing classes keep the list they were created with.

3. Open `http://localhost:3000/admin/courses/<COURSE_UUID>`. Expect the same card, with the helper copy naming **course** instead of program.

If any of the three 404s, the branch checkout did not take or the dev server was not restarted.

**Acceptance criteria:**

- [ ] `/admin/prerequisites` loads, reachable from the sidebar after **Instructors**.
- [ ] `/admin/programs/<PROGRAM_UUID>` and `/admin/courses/<COURSE_UUID>` both show a **Prerequisites** card with the correct helper copy.

### 2.2 Seed the global prerequisite catalog

At `/admin/prerequisites`, create these five. The spread is deliberate: all four input types, all three expiration rules, and one optional-by-default type.

| Name | Input type | Required by default | Expiration rule | Months |
| -- | -- | -- | -- | -- |
| `CPR Certification` | File upload | ✔ | Expires a set number of months after the issue date | `24` |
| `Immunization Record` | File upload | ✔ | Student-provided expiration | — |
| `High School Graduation Date` | Date | ✔ | Never expires | — |
| `Background Check Consent` | Checkbox | ✔ | Never expires | — |
| `Emergency Contact` | Text | ✘ | Never expires | — |

Expect the **Valid for (months)** field to be **hidden** until the rule is set to the duration option, and to appear when it is.

Then capture the ids:

```sql
select id, name, input_type, required_by_default, expiration_rule, expiration_duration_months
from prerequisite_types
where archived_at is null
order by name;
```

Expect exactly five rows matching the table above — `Emergency Contact` with `required_by_default = false`, `CPR Certification` with `expiration_rule = 'duration_from_issue'` and `expiration_duration_months = 24`, `Immunization Record` with `'fixed_date'`, the other two with `'none'` and a NULL duration.

Record all five ids in the ledger as `CPR_TYPE_ID`, `IMMUNIZATION_TYPE_ID`, `DIPLOMA_TYPE_ID`, `BACKGROUND_TYPE_ID`, `CONTACT_TYPE_ID`.

**Acceptance criteria:**

- [ ] All five types exist with the exact input types, required-by-default, and expiration settings shown in the table.
- [ ] **Valid for (months)** is hidden except for the duration rule.
- [ ] All five ids are recorded in the ledger.

### 2.3 Catalog validation, uniqueness, and archiving

Four checks, all against the catalog you just seeded.

**Duration is mandatory for the duration rule.** In the UI, edit `CPR Certification`, clear **Valid for (months)**, and save. Expect the inline error:

> Enter how many months this stays valid.

Then prove the database enforces it independently, so a future caller that bypasses the form cannot write a bad row:

```sql
update prerequisite_types
set expiration_rule = 'duration_from_issue', expiration_duration_months = null
where id = '<CPR_TYPE_ID>';
```

Expect failure on `prerequisite_types_expiration_rule_check`. Repeat with `expiration_duration_months = 0` — expect the same failure, since the constraint requires a positive value.

**Normalized uniqueness.** Same name and same input type may not repeat, regardless of case or surrounding whitespace:

```sql
insert into prerequisite_types (name, input_type)
values ('  cpr certification  ', 'file_upload');
```

Expect failure on `prerequisite_types_name_input_type_key`.

**Same name, different input type is allowed:**

```sql
insert into prerequisite_types (name, input_type)
values ('CPR Certification', 'text');
```

Expect success. Clean it up so it does not clutter later pickers:

```sql
delete from prerequisite_types where name = 'CPR Certification' and input_type = 'text';
```

**Create-new appears only on a genuine miss.** Back at `/admin/prerequisites` or in a template picker, type `CPR` — expect matching results and **no** create-new prompt. Type `Wilderness First Aid` — expect the prompt reading:

> No match for "Wilderness First Aid". Create it:

with an input-type select offering **File upload** / **Date** / **Text** / **Checkbox**. Create it, and confirm it becomes selected immediately without re-searching.

**Archiving is non-destructive.** Archive `Wilderness First Aid`:

```sql
select id, name, archived_at from prerequisite_types where name = 'Wilderness First Aid';
```

Expect one row, still present, with a non-null `archived_at`. The row must not be deleted — anything already referencing it must keep working.

**Acceptance criteria:**

- [ ] Missing/zero duration is rejected both by the form and by `prerequisite_types_expiration_rule_check`.
- [ ] A case/whitespace-duplicate name+input-type insert fails; the same name with a different input type succeeds.
- [ ] Create-new appears only on a genuine zero-result search.
- [ ] Archiving sets `archived_at` without deleting the row.

### 2.4 Assign prerequisites to the program template

At `/admin/programs/<PROGRAM_UUID>` → **Prerequisites** card → **Add a prerequisite...**

Add four, in this order: `CPR Certification`, `High School Graduation Date`, `Background Check Consent`, `Emergency Contact`.

Expect **Required** to arrive pre-checked from each type's `required_by_default` — so the first three checked, `Emergency Contact` unchecked. Leave them that way; §3.6 depends on exactly one optional item existing.

```sql
select tp.sort_order, pt.name, tp.is_required
from template_prerequisites tp
join prerequisite_types pt on pt.id = tp.prerequisite_type_id
where tp.course_uuid = '<PROGRAM_UUID>'
order by tp.sort_order;
```

Expect four rows, `sort_order` `0,1,2,3`, in the order added, with `is_required` `true,true,true,false`.

Now reorder: move `Background Check Consent` to the top using the `▲` button. Expect `▲` disabled on the first row and `▼` disabled on the last — there is no drag-and-drop. Re-run the query:

```sql
select tp.sort_order, pt.name
from template_prerequisites tp
join prerequisite_types pt on pt.id = tp.prerequisite_type_id
where tp.course_uuid = '<PROGRAM_UUID>'
order by tp.sort_order;
```

Expect `sort_order` to still be a dense `0,1,2,3` with no gaps, and `Background Check Consent` at `0`.

**Acceptance criteria:**

- [ ] Four assignments exist with `is_required` pre-checked from each type's `required_by_default`.
- [ ] Reordering keeps `sort_order` dense with no gaps; `▲`/`▼` disable correctly at the first/last row.

### 2.5 Give the course template a different list

At `/admin/courses/<COURSE_UUID>` → **Prerequisites** card, add just two: `Immunization Record` and `Emergency Contact`.

```sql
select
  (select count(*) from template_prerequisites where course_uuid = '<PROGRAM_UUID>') as program_count,
  (select count(*) from template_prerequisites where course_uuid = '<COURSE_UUID>')  as course_count;
```

Expect `4` and `2`. Reload the program page and confirm its list is unchanged — the two surfaces write to the same table but are scoped by `course_uuid`, and a leak between them would show up here as a count of 6 on one side.

**Acceptance criteria:**

- [ ] The program count is `4` and the course count is `2`, with no cross-contamination between them.

### 2.6 Create a class from the template and confirm the snapshot

On `/admin/programs/<PROGRAM_UUID>`, click **Add Class**. Fill the form and set the start date **30 days out** — this puts the class comfortably in the future so every credential starts out valid, and lets §3.7 control the "expires before class starts" transition by moving dates in SQL rather than waiting.

The class code is generated from the course code on save; read it off the resulting `/admin/classes/<uuid>` page.

Record the new class as `CLASS_A_UUID` (from the URL) and `CLASS_A_CODE` (the displayed code, e.g. `PARA-003`). Both go in the ledger — §3 through §6 use one or the other constantly.

On `/admin/classes/<CLASS_A_UUID>`, expect a **read-only** Prerequisites card — no add, edit, or remove controls — listing the same four items in the same order with the same Required values, under the copy:

> Copied from the template when this class was created. Editing the template does not change this list.

```sql
select cp.sort_order, pt.name, cp.is_required, cp.source_course_uuid
from class_prerequisites cp
join prerequisite_types pt on pt.id = cp.prerequisite_type_id
where cp.class_id = '<CLASS_A_UUID>'
order by cp.sort_order;
```

Expect four rows exactly matching §2.4's final ordering, with `source_course_uuid` equal to `PROGRAM_UUID` on every row.

Check the `npm run dev` terminal for:

```
Snapshotted class prerequisites: { class_id: ..., count: 4 }
```

**Acceptance criteria:**

- [ ] `CLASS_A_UUID`/`CLASS_A_CODE` are recorded, with a start date 30 days out.
- [ ] The class's Prerequisites card is read-only and matches the template's four items and order.
- [ ] `class_prerequisites` rows match `template_prerequisites` exactly, with `source_course_uuid = PROGRAM_UUID`.
- [ ] The `Snapshotted class prerequisites` log line appears with `count: 4`.

### 2.7 Prove the snapshot is frozen, and that gaps degrade gracefully

**The snapshot does not follow the template.** On `/admin/programs/<PROGRAM_UUID>`, remove `Emergency Contact` and add `Immunization Record`. Expect the removal confirmation:

> Remove this prerequisite from the template? Classes already created keep theirs.

Reload `/admin/classes/<CLASS_A_UUID>` and re-run the `class_prerequisites` query from §2.6. Expect it **completely unchanged** — same four rows, same order, same ids. `Emergency Contact` must still be there and `Immunization Record` must not.

**Snapshots are taken at creation time.** Create a *second* class from the same template. Record it as `CLASS_B_UUID`.

```sql
select cp.sort_order, pt.name, cp.is_required
from class_prerequisites cp
join prerequisite_types pt on pt.id = cp.prerequisite_type_id
where cp.class_id = '<CLASS_B_UUID>'
order by cp.sort_order;
```

Expect four rows reflecting the **new** template list — `Immunization Record` present, `Emergency Contact` absent. Two classes off one template, each holding the list as it stood when they were created. That contrast is the whole point of the feature.

**Zero prerequisites is a valid template.** Create a class from a template with no assignments at all. Expect the class to be created successfully and its card to read:

> No prerequisites on this class.

**Pre-migration classes are unaffected.** Open `/admin/classes/<LEGACY_CLASS_UUID>`. Expect the same `No prerequisites on this class.` with no error. There is deliberately no backfill.

**Snapshot failure is non-fatal.** Temporarily break the table, create a class, then restore:

```sql
alter table class_prerequisites rename to class_prerequisites_tmp;
```

Create a class through the UI. Expect the class to be **created anyway**, with `Failed to snapshot class prerequisites` in the `npm run dev` log.

```sql
alter table class_prerequisites_tmp rename to class_prerequisites;
```

Delete the throwaway class, and re-run the `CLASS_A_UUID` query one more time to confirm nothing was disturbed. **Do not skip the rename back** — every section after this one queries `class_prerequisites` by name.

**Acceptance criteria:**

- [ ] Editing the template after class creation leaves `CLASS_A_UUID`'s snapshot byte-identical; a second class (`CLASS_B_UUID`) picks up the template's new list.
- [ ] A zero-prerequisite template and `LEGACY_CLASS_UUID` both read `No prerequisites on this class.`
- [ ] A broken `class_prerequisites` table does not block class creation; the table is restored afterward.

### 2.8 Pass criteria and merge

- [ ] Catalog CRUD works; validation is enforced in both the form and the database.
- [ ] Normalized uniqueness rejects a case/whitespace duplicate and allows a different input type.
- [ ] Create-new appears only on a genuine zero-result query.
- [ ] Archiving is non-destructive.
- [ ] Program and course templates hold independent lists; reorder produces dense `sort_order`.
- [ ] A new class receives a read-only snapshot matching its template at creation time.
- [ ] Editing the template leaves existing classes byte-identical; a later class picks up the new list.
- [ ] Templates with zero prerequisites, and classes predating migration `27`, both degrade to `No prerequisites on this class.`
- [ ] Snapshot failure does not block class creation.

Mark [BEN-687](https://linear.app/midwestern/issue/BEN-687) **Done**, then move to the next branch:

```bash
git checkout 683-tiered-enrollment
```

Do not merge anything yet. All five merges happen together in §7.1, after the whole chain passes.

---

## 3. [BEN-683](https://linear.app/midwestern/issue/BEN-683/store-class-prerequisites-and-student-credential-records) — Store class prerequisites and student credential records

**Outcome to prove:** enrollment state is driven by student credential records rather than hard-coded tier logic — a class carries a stable snapshot, credentials are student-owned and reusable across classes, and expiry is stored on the record.

**Branch:**

```bash
git checkout 683-tiered-enrollment
npm run dev
```

**Migrations:** `28` and `29`, applied in §3.1 below.

**Inherits:** the class `CLASS_A_CODE` / `CLASS_A_UUID` with its four-item snapshot (§2.6), the five catalog type ids (§2.2), Student A (§1.6).

**What is new here:** there is still no student-facing UI — that arrives in [BEN-686](https://linear.app/midwestern/issue/BEN-686). Everything in this section runs against two API routes and SQL. That is the correct level for this L1: it is the data model and the evaluator.

**Leaves behind:** Student A holding an approved, unexpired `CPR Certification` credential. §4 relies on that to show a shortened wizard.

### 3.1 Apply migrations 28 and 29

Run in the test project's SQL Editor, in order. Both are in `supabase/migrations/`.

**`28_create_student_credentials.sql`** — creates `student_credentials`, the `latest_student_credentials` view, RLS policies, and the private `student-credentials` storage bucket with its object policies.

**`29_compute_credential_validity.sql`** — creates `compute_credential_expiry(date, text, integer)` and backfills `expires_at` for any `duration_from_issue` rows written between the two migrations.

Confirm all three artifacts landed:

```sql
select 'table' as kind, table_name as name from information_schema.tables
  where table_schema='public' and table_name='student_credentials'
union all
select 'view', table_name from information_schema.views
  where table_schema='public' and table_name='latest_student_credentials'
union all
select 'function', proname from pg_proc where proname='compute_credential_expiry';
```

Expect three rows. Then confirm the bucket exists **and is private** — this is what makes §3.8's signed-URL check meaningful:

```sql
select id, name, public from storage.buckets where id = 'student-credentials';
```

Expect one row with `public = false`. Also confirm it is visible under Storage in the Supabase dashboard.

Test the month-end clamping directly, before any credential exists:

```sql
select compute_credential_expiry('2026-01-31', 'duration_from_issue', 1) as clamped,
       compute_credential_expiry('2026-01-15', 'duration_from_issue', 24) as two_years,
       compute_credential_expiry('2026-01-15', 'none', null) as no_rule;
```

Expect `2026-02-28`, `2028-01-15`, and `NULL`. Month arithmetic lives in Postgres precisely so every caller clamps identically.

**Acceptance criteria:**

- [ ] `student_credentials`, `latest_student_credentials`, and `compute_credential_expiry` all exist.
- [ ] The `student-credentials` bucket exists with `public = false`.
- [ ] `compute_credential_expiry` clamps month-end and computes durations correctly.

### 3.2 Get a student bearer token for Student A

Both API routes derive `studentId` from the verified token and ignore anything in the body, so you cannot test them without a real student session.

1. `http://localhost:3000/student/login` → enter `alexbensonux+preqA@gmail.com` → read the OTP from the test project's Authentication → Logs (or your inbox) → submit.
2. DevTools → Application → Local Storage → `http://localhost:3000` → the `sb-…-auth-token` key → copy `access_token`.
3.
   ```bash
   export STUDENT_A_TOKEN="<paste the access_token>"
   curl -s -H "Authorization: Bearer $STUDENT_A_TOKEN" \
     "$BASE_URL/api/prerequisites/evaluate?classId=$CLASS_A_UUID" | jq
   ```

Expect `success: true` with an `evaluation` object containing four `items` (one per class prerequisite), an `outstanding` array of the three required ones, and `allRequiredSatisfied: false`. Every item's `status` should be `missing` except `Emergency Contact`, which should be `not_required`.

Confirm the auth boundary while you are here:

```bash
curl -s "$BASE_URL/api/prerequisites/evaluate?classId=$CLASS_A_UUID" | jq
curl -s -H "Authorization: Bearer $STUDENT_A_TOKEN" "$BASE_URL/api/prerequisites/evaluate" | jq
```

Expect `401` with `Unauthorized - Missing or invalid authorization header`, then `400` with `classId is required`.

**Acceptance criteria:**

- [ ] `STUDENT_A_TOKEN` is captured and returns 4 `items`, 3 in `outstanding`, `allRequiredSatisfied: false`.
- [ ] Missing auth returns `401`; a missing `classId` returns `400`.

### 3.3 Submit one credential of each input type

`POST /api/prerequisites/credentials` takes **multipart form data**, not JSON. Field names: `prerequisiteTypeId`, `submittedForClassId`, `valueText`, `valueDate`, `valueBoolean`, `issuedAt`, `expiresAt`, `file`.

**Checkbox:**

```bash
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=<BACKGROUND_TYPE_ID>" \
  -F "submittedForClassId=$CLASS_A_UUID" \
  -F "valueBoolean=true" \
  "$BASE_URL/api/prerequisites/credentials" | jq
```

**Date:**

```bash
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=<DIPLOMA_TYPE_ID>" \
  -F "submittedForClassId=$CLASS_A_UUID" \
  -F "valueDate=2015-06-01" \
  "$BASE_URL/api/prerequisites/credentials" | jq
```

**File upload with a computed expiry** — this is the `duration_from_issue` type, so `issuedAt` is mandatory:

```bash
printf '%%PDF-1.4 test credential' > /tmp/cpr-card.pdf
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=$CPR_TYPE_ID" \
  -F "submittedForClassId=$CLASS_A_UUID" \
  -F "issuedAt=2026-01-15" \
  -F "file=@/tmp/cpr-card.pdf" \
  "$BASE_URL/api/prerequisites/credentials" | jq
```

Each should return `success: true` with the created `credential`. Record the CPR one's `id` as `CPR_CREDENTIAL_ID`.

```sql
select sc.id, pt.name, sc.review_status,
       sc.value_text, sc.value_date, sc.value_boolean, sc.file_url,
       sc.issued_at, sc.expires_at, sc.submitted_for_class_id
from student_credentials sc
join prerequisite_types pt on pt.id = sc.prerequisite_type_id
where sc.student_id = '<STUDENT_A_UUID>'
order by sc.submitted_at;
```

Expect three rows, all `pending`, all with `submitted_for_class_id = CLASS_A_UUID`, and **exactly one** typed value column populated per row matching its `input_type`. The CPR row should have `issued_at = 2026-01-15` and `expires_at = 2028-01-15` — computed and stored at write time by migration `29`'s function.

Now confirm type enforcement — submitting the wrong shape must be rejected rather than written as a half-empty row:

```bash
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=<IMMUNIZATION_TYPE_ID>" \
  -F "valueText=I promise I have one" \
  "$BASE_URL/api/prerequisites/credentials" | jq
```

Expect `400` with `A file is required.`

```bash
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=$CPR_TYPE_ID" \
  -F "file=@/tmp/cpr-card.pdf" \
  "$BASE_URL/api/prerequisites/credentials" | jq
```

Expect `400` with `An issue date is required for this prerequisite.` — the type's rule is `duration_from_issue`, so expiry cannot be computed without one.

**Acceptance criteria:**

- [ ] Checkbox, date, and file submissions all succeed; `CPR_CREDENTIAL_ID` is recorded.
- [ ] Each row has exactly one populated typed-value column matching its `input_type`.
- [ ] The CPR row's `expires_at` is `2028-01-15`.
- [ ] Wrong-shape submissions are rejected with the correct error messages.

### 3.4 History is preserved, never overwritten

Submit `Background Check Consent` a second time:

```bash
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=<BACKGROUND_TYPE_ID>" \
  -F "submittedForClassId=$CLASS_A_UUID" \
  -F "valueBoolean=true" \
  "$BASE_URL/api/prerequisites/credentials" | jq
```

```sql
select id, review_status, submitted_at
from student_credentials
where student_id = '<STUDENT_A_UUID>' and prerequisite_type_id = '<BACKGROUND_TYPE_ID>'
order by submitted_at;
```

Expect **two** rows: the first now `superseded`, the second `pending`. The first must still exist — nothing is deleted, nothing is updated in place.

```sql
select id, review_status, submitted_at
from latest_student_credentials
where student_id = '<STUDENT_A_UUID>' and prerequisite_type_id = '<BACKGROUND_TYPE_ID>';
```

Expect **exactly one** row — the newer of the two. This view is the shared definition of "current credential"; everything downstream reads through it.

**Acceptance criteria:**

- [ ] Resubmitting inserts a new row and marks the prior one `superseded` rather than overwriting it.
- [ ] `latest_student_credentials` returns exactly one row — the newest.

### 3.5 Expiry is computed at write time, not read time

Change the catalog type's duration out from under an existing credential:

```sql
update prerequisite_types set expiration_duration_months = 12 where id = '<CPR_TYPE_ID>';

select id, issued_at, expires_at from student_credentials where id = '<CPR_CREDENTIAL_ID>';
```

Expect `expires_at` **still** `2028-01-15`. A stored expiry that moved would mean the value is being recomputed on read, which would silently reprice every historical credential whenever staff edit the catalog.

Put it back:

```sql
update prerequisite_types set expiration_duration_months = 24 where id = '<CPR_TYPE_ID>';
```

Confirm a `none`-rule type stores no expiry even when one is supplied:

```bash
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=<DIPLOMA_TYPE_ID>" \
  -F "submittedForClassId=$CLASS_A_UUID" \
  -F "valueDate=2015-06-01" \
  -F "expiresAt=2030-01-01" \
  "$BASE_URL/api/prerequisites/credentials" | jq
```

```sql
select expires_at from latest_student_credentials
where student_id = '<STUDENT_A_UUID>' and prerequisite_type_id = '<DIPLOMA_TYPE_ID>';
```

Expect `NULL`. The rule on the type wins over anything the client sends.

**Acceptance criteria:**

- [ ] Changing the catalog's duration does not move an existing credential's stored `expires_at`.
- [ ] A `none`-rule type stores `NULL` expiry even when one is supplied in the request.

### 3.6 Evaluate: satisfied, pending, optional, missing

There is no approval UI on this branch — that is [BEN-684](https://linear.app/midwestern/issue/BEN-684). Approve the CPR credential directly so the "already holds a credential" path can be exercised:

```sql
update student_credentials
set review_status = 'approved', reviewed_at = now()
where id = '<CPR_CREDENTIAL_ID>';
```

```bash
curl -s -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  "$BASE_URL/api/prerequisites/evaluate?classId=$CLASS_A_UUID" | jq '.evaluation'
```

Expect, across the four items:

| Prerequisite | `status` | In `outstanding`? |
| -- | -- | -- |
| `CPR Certification` | `satisfied` | no |
| `Background Check Consent` | `pending_review` | **no** |
| `High School Graduation Date` | `pending_review` | **no** |
| `Emergency Contact` | `not_required` | no |

and `allRequiredSatisfied: false`.

Two of those deserve attention. A `pending_review` item is **not** outstanding — the student has done their part and must not be nagged to resubmit while staff are reviewing. And the optional item is never outstanding and never blocks `allRequiredSatisfied`, no matter its state.

Every item should also carry its own `expires_at`, lifted from the latest credential and `null` where there is none.

**Credentials are portable across classes.** `CLASS_B_UUID` from §2.7 requires CPR too, and Student A has never submitted anything for it:

```bash
curl -s -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  "$BASE_URL/api/prerequisites/evaluate?classId=<CLASS_B_UUID>" | jq '.evaluation.items[] | {status, is_required}'
```

Expect `CPR Certification` to come back `satisfied` here as well, with no new submission. That is the central claim of this L1.

**A class with no snapshot is open, not blocked:**

```bash
curl -s -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  "$BASE_URL/api/prerequisites/evaluate?classId=<LEGACY_CLASS_UUID>" | jq '.evaluation'
```

Expect `items: []`, `outstanding: []`, and `allRequiredSatisfied: **true**`. `false` here would lock every pre-existing class in the system.

**Evaluation does not require an enrollment.** Student A has no `enrollments` row for `CLASS_A_UUID` yet — every call above already proves this. The post-payment flow in §4 depends on it, because the wizard loads while the Stripe webhook is still in flight.

**Acceptance criteria:**

- [ ] Statuses match the table exactly; `pending_review` and the optional item are absent from `outstanding`.
- [ ] The same approved credential satisfies `CLASS_B_UUID` (a different class requiring the same type) with no new submission.
- [ ] A class with no snapshot returns `allRequiredSatisfied: true`.
- [ ] Evaluation succeeds with no enrollment row present.

### 3.7 Expiry boundaries and minimum validity against class start

All four checks move the CPR credential's stored `expires_at` and re-evaluate. `CLASS_A_UUID`'s start date is 30 days out from §2.6.

**Expiring today is still valid:**

```sql
update student_credentials set expires_at = current_date where id = '<CPR_CREDENTIAL_ID>';
```

Re-run the evaluate call. Expect `satisfied`.

**Expired yesterday is not:**

```sql
update student_credentials set expires_at = current_date - 1 where id = '<CPR_CREDENTIAL_ID>';
```

Expect `expired`, and the item now present in `outstanding`.

**Valid now but not on the first day of class:**

```sql
update student_credentials set expires_at = current_date + 10 where id = '<CPR_CREDENTIAL_ID>';
```

Expect `expiring_before_class` (the credential dies 20 days before the class starts), present in `outstanding`, and `allRequiredSatisfied: false`. An already-expired credential must read `expired`, not this — which the previous check confirms.

**Nothing to compare against:**

```sql
update classes set class_start_date = null where id = '<CLASS_A_UUID>';
```

Expect `satisfied`. Then restore the class date and the credential, so §4 starts from a clean, valid state:

```sql
update classes set class_start_date = (current_date + interval '30 days')::date
where id = '<CLASS_A_UUID>';

update student_credentials set expires_at = '2028-01-15' where id = '<CPR_CREDENTIAL_ID>';
```

Re-run the evaluate call once more and confirm CPR is back to `satisfied`. **Do not skip this restore** — §4 through §6 assume Student A holds one valid approved credential.

**Acceptance criteria:**

- [ ] Today → `satisfied`; yesterday → `expired`; 10 days out (before class start) → `expiring_before_class`; NULL class start → `satisfied`.
- [ ] The class start date and the CPR credential's `expires_at` are both restored before moving on.

### 3.8 File privacy and the security boundary

**Files are stored as object paths, not URLs:**

```sql
select file_url from student_credentials where id = '<CPR_CREDENTIAL_ID>';
```

Expect the form `<STUDENT_A_UUID>/<CPR_TYPE_ID>/<uuid>-cpr-card.pdf` — an object path inside the private bucket. A value beginning `http` would mean a public URL was stored, which would make every uploaded document world-readable.

**Upload rejections:**

```bash
mkfile 12m /tmp/too-big.pdf 2>/dev/null || dd if=/dev/zero of=/tmp/too-big.pdf bs=1m count=12
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=$CPR_TYPE_ID" -F "issuedAt=2026-01-15" -F "file=@/tmp/too-big.pdf" \
  "$BASE_URL/api/prerequisites/credentials" | jq
```

Expect `File must be 10MB or smaller.`

```bash
echo "not a pdf" > /tmp/notes.txt
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=$CPR_TYPE_ID" -F "issuedAt=2026-01-15" -F "file=@/tmp/notes.txt" \
  "$BASE_URL/api/prerequisites/credentials" | jq
```

Expect `Only PDF, JPEG, PNG, and HEIC files are accepted.`

**A forged `studentId` in the body is ignored.** The route reads the id off the verified token and never from the payload:

```bash
curl -s -X POST -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  -F "prerequisiteTypeId=<BACKGROUND_TYPE_ID>" \
  -F "studentId=<STUDENT_B_UUID>" \
  -F "valueBoolean=true" \
  "$BASE_URL/api/prerequisites/credentials" | jq '.credential.student_id'
```

Expect `STUDENT_A_UUID`, not `STUDENT_B_UUID`.

**RLS keeps students out of each other's records.** In the Supabase dashboard SQL Editor you are service-role and will see everything, so this one has to run as the student:

```bash
curl -s "https://<TEST_PROJECT_REF>.supabase.co/rest/v1/student_credentials?student_id=eq.<STUDENT_B_UUID>" \
  -H "apikey: <test project anon key>" \
  -H "Authorization: Bearer $STUDENT_A_TOKEN" | jq
```

Expect `[]`. Any row returned means the `Students can read own credentials` policy is not doing its job.

**Acceptance criteria:**

- [ ] `file_url` is a private object path, never an `http` URL.
- [ ] Oversized and wrong-MIME uploads are rejected with the correct messages.
- [ ] A forged `studentId` in the body is ignored in favor of the token's identity.
- [ ] RLS returns `[]` when Student A's token queries Student B's credentials.

### 3.9 Pass criteria and merge

- [ ] Migrations `28`/`29` applied; the `student-credentials` bucket exists and is private.
- [ ] `compute_credential_expiry` clamps month-end correctly.
- [ ] One typed value column per credential, matching the type's `input_type`; mismatches are rejected.
- [ ] Resubmission inserts a new row and supersedes the old; `latest_student_credentials` returns exactly one.
- [ ] Expiry is stored at write time and does not move when the catalog changes.
- [ ] Evaluation classifies satisfied / pending / optional / missing correctly, and `pending_review` is not outstanding.
- [ ] An approved credential satisfies a *different* class requiring the same type.
- [ ] A class with no snapshot returns `allRequiredSatisfied: true`.
- [ ] Evaluation works with no enrollment row present.
- [ ] Expiry boundaries: today valid, yesterday expired, expiring-before-class flagged, NULL class start satisfied.
- [ ] Files stored as private object paths; size and MIME rejections fire; forged `studentId` ignored; RLS blocks cross-student reads.
- [ ] Student A's CPR credential is left `approved` with `expires_at = 2028-01-15` and the class start date restored to 30 days out.

Mark [BEN-683](https://linear.app/midwestern/issue/BEN-683) **Done**, then:

```bash
git checkout 686-tiered-enrollment
```

---

## 4. [BEN-686](https://linear.app/midwestern/issue/BEN-686/collect-class-prerequisites-after-payment-and-from-the-student-profile) — Collect class prerequisites after payment and from the student profile

**Outcome to prove:** a student can move from payment into prerequisite completion, leave work unfinished, and later finish it from their profile without losing class-specific state.

**Branch:**

```bash
git checkout 686-tiered-enrollment
npm run dev
```

**Migrations:** none. This L1 is entirely application-layer over migrations `24`–`29`, already applied.

**Inherits:** `CLASS_A_UUID` / `CLASS_A_CODE` with four snapshotted prerequisites (§2.6); Student A holding an approved `CPR Certification` (§3.6) and two `pending` items (§3.3); Student B with nothing at all (§1.6); the Stripe test payment link (§1.4).

**What is new here:** the first student-facing UI in the stack — the post-payment wizard at `/student/prerequisites/<CLASS CODE>` and the **Class requirements** card on `/student/profile`.

**Leaves behind:** Student B enrolled with everything skipped; Student A enrolled with submissions waiting for review. §5 reviews those.

### 4.1 Wire the class to the Stripe payment link and confirm the return URL

`/checkout/confirm` reads `classes.stripe_payment_link` and redirects there. Without it, checkout fails with `Class "<code>" does not have a stripe_payment_link set`.

```sql
update classes
set stripe_payment_link = '<STRIPE_PAYMENT_LINK_URL>'
where id = '<CLASS_A_UUID>';

select class_id, class_name, class_start_date, stripe_payment_link
from classes where id = '<CLASS_A_UUID>';
```

Expect one row with the test link (`https://buy.stripe.com/test_…`) and a start date 30 days out.

Before spending a payment on it, confirm the link's **After payment** setting in the Stripe dashboard still redirects to `http://localhost:3000/checkout/success`. That URL is configured on the Stripe object, not in this repo, and getting it wrong strands the student on Stripe's own confirmation page with no route into the wizard.

**Acceptance criteria:**

- [ ] `CLASS_A_UUID.stripe_payment_link` is set to `STRIPE_PAYMENT_LINK_URL`.
- [ ] The Payment Link's After-payment redirect is confirmed pointing at `http://localhost:3000/checkout/success`.

### 4.2 Register Student B and pay the registration fee

Student B is the clean case — no credentials, so the wizard should show every required step.

1. Open `http://localhost:3000/checkout/details?classID=<CLASS_A_CODE>`.
2. Enter `alexbensonux+preqB@gmail.com` and `Prereq Student B` → **Continue to Payment** → **Confirm**.
3. On the Stripe-hosted page, pay with `4242 4242 4242 4242`, any future expiry, any CVC and ZIP.
4. Watch the `stripe listen` terminal for `checkout.session.completed` forwarded with a `200`, and the `npm run dev` terminal for the enrollment log lines.

You should land on `/checkout/success` showing:

> Payment Successful!

with a **Continue to class requirements** button and the line **You'll be asked to sign in to continue.** The old **Return to Home** → `/admin` button must be gone — that was the pre-[BEN-855](https://linear.app/midwestern/issue/BEN-855) behavior and sending a paying student to the admin dashboard is the bug this replaced.

```sql
select e.id as enrollment_id, e.enrollment_status, s.email
from enrollments e join students s on s.id = e.student_id
where e.class_id = '<CLASS_A_UUID>';
```

Expect one row for Student B, `registered`. Record its `id` as `ENROLLMENT_B_UUID`.

Now do the same for **Student A** (`alexbensonux+preqA@gmail.com`), so §5 and §6 have their throughline enrolled. Record that enrollment id as `ENROLLMENT_A_UUID` — §6.6 and §6.7 use it.

**Acceptance criteria:**

- [ ] Both payments complete and land on `/checkout/success` with the correct copy and the **Continue to class requirements** button.
- [ ] `stripe listen` forwards `checkout.session.completed` with a `200` for both.
- [ ] `ENROLLMENT_B_UUID` and `ENROLLMENT_A_UUID` are both recorded, `registered`.

### 4.3 Walk the post-payment wizard

Click **Continue to class requirements** as Student B. Expect a redirect to:

```
/student/login?next=%2Fstudent%2Fprerequisites%2F<CLASS_A_CODE>
```

Complete OTP for `alexbensonux+preqB@gmail.com`. Expect to land on `/student/prerequisites/<CLASS_A_CODE>` — **not** `/student`. The `next` param has to survive both the login page and the OTP page.

Note the route segment is the class **code**, not the UUID. That is the one place in the prerequisite work where a code is used in a path.

On the wizard, expect:

- Header **Class requirements**, and **Step 1 of 3**. Three, not four — `Emergency Contact` is optional and never becomes a step.
- One prerequisite per screen, in `sort_order`.
- **No** mention of payment, invoices, balance, or tiers anywhere on the page. Prerequisites and money are separate conversations, and this page is the one most likely to blur them.
- Input rendering by type: `Background Check Consent` → a single checkbox; `High School Graduation Date` → a date input; `CPR Certification` → a file picker plus an **Issue date** field. The **Issue date** field appears only for `duration_from_issue` types; **Expiration date** only for `fixed_date` types that are not already a date input.

Submit step 1 with **Continue**, then use **Skip for now** on the remaining two.

```sql
select pt.name, sc.review_status, sc.submitted_for_class_id
from student_credentials sc
join prerequisite_types pt on pt.id = sc.prerequisite_type_id
where sc.student_id = '<STUDENT_B_UUID>'
order by sc.submitted_at desc;
```

Expect **exactly one** row — the item you submitted, `pending`, with `submitted_for_class_id = CLASS_A_UUID`. Skipping writes nothing at all.

At the end, expect the completion panel to read:

> Some requirements are still outstanding

The three panel variants are: all approved → **You're all set**; anything pending and nothing skipped → **Thanks — we're reviewing your submissions**; anything skipped → the line above.

**Acceptance criteria:**

- [ ] The `next` param survives login and OTP, landing on the wizard at the class-code route.
- [ ] Step count is 3, not 4; no payment/invoice/tier language appears anywhere on the page.
- [ ] **Continue** writes exactly one `pending` credential; **Skip for now** writes nothing.
- [ ] The completion panel reads **Some requirements are still outstanding**.

### 4.4 Finish the skipped items from the profile

Still as Student B, go to `/student/profile`. Expect a **Class requirements** card with a row for `CLASS_A_CODE` summarizing **2 requirements outstanding**, expanded by default because there is outstanding work.

Click **Continue** (or **Start** on a specific row). Expect to land on:

```
/student/prerequisites/<CLASS_A_CODE>?from=profile
```

with a **← Back to profile** link at the top and the wizard reopening at **Step 1 of 2** — only the two skipped items. The submitted one must not reappear.

Complete both.

```sql
select pt.name, sc.review_status, sc.submitted_for_class_id, sc.submitted_at
from student_credentials sc
join prerequisite_types pt on pt.id = sc.prerequisite_type_id
where sc.student_id = '<STUDENT_B_UUID>'
order by sc.submitted_at;
```

Expect three `pending` rows, all with `submitted_for_class_id = CLASS_A_UUID`. Credentials written from the profile path must be indistinguishable in shape from the one written post-payment — same table, same class context. There is only one route behind both entry points, so any divergence here is a bug.

**Acceptance criteria:**

- [ ] The profile card correctly summarizes outstanding count and is expanded by default while work remains.
- [ ] The profile-path wizard reopens only the skipped items and writes rows identically shaped to the post-payment path.

### 4.5 Status display across states

Reload `/student/profile` as Student B. Expect the class row summary to read **Awaiting review**, and the class to be **collapsed** now that nothing is outstanding. Expand it: each item reads **Pending review** with **no** action link — there is nothing for the student to do while staff review.

Now log in as **Student A** (`alexbensonux+preqA@gmail.com`) and check `/student/profile`. Student A's mix exercises more of the badge set at once:

| Prerequisite | Expected badge | Action link |
| -- | -- | -- |
| `CPR Certification` | **Approved** | none |
| `Background Check Consent` | **Pending review** | none |
| `High School Graduation Date` | **Pending review** | none |
| `Emergency Contact` | **Optional** | none blocking |

Force the two remaining badges so all seven are seen at least once:

```sql
update student_credentials set expires_at = current_date - 1 where id = '<CPR_CREDENTIAL_ID>';
```

Reload — expect **Expired** with a **Renew** link.

```sql
update student_credentials set expires_at = current_date + 10 where id = '<CPR_CREDENTIAL_ID>';
```

Reload — expect **Expires before class starts** with a **Renew** link. Then restore:

```sql
update student_credentials set expires_at = '2028-01-15' where id = '<CPR_CREDENTIAL_ID>';
```

**Needs resubmission** is the seventh; it appears in §5.4 after a real rejection, so leave it for now.

**Freshness without polling.** Leave `/student/profile` open. In another tab, run:

```sql
update student_credentials set review_status = 'approved'
where student_id = '<STUDENT_B_UUID>' and prerequisite_type_id = '<BACKGROUND_TYPE_ID>';
```

Click back into the profile tab. Expect the badge to update on focus with **no** manual reload. Then leave the tab untouched for 60 seconds with the network panel open — expect **no** repeated `/api/prerequisites/evaluate` calls. Refresh-on-focus is intentional; polling would be a regression.

Undo it so §5 has a genuinely pending queue:

```sql
update student_credentials set review_status = 'pending', reviewed_at = null
where student_id = '<STUDENT_B_UUID>' and prerequisite_type_id = '<BACKGROUND_TYPE_ID>';
```

**Acceptance criteria:**

- [ ] All applicable badges render correctly for both students, including forced **Expired** and **Expires before class starts**.
- [ ] The profile updates on tab focus with no manual reload, and issues no repeated `/api/prerequisites/evaluate` calls over 60 idle seconds.

### 4.6 Edge cases

**Open-redirect guard.** Only `next` values starting `/student/` are honored:

```
http://localhost:3000/student/login?next=https://evil.example.com
```

Complete OTP. Expect to land on `/student`, never the external URL.

**A class with no snapshot.** Visit `/student/prerequisites/<LEGACY_CLASS_CODE>`. Expect **You're all set** with no steps and no error.

**A student with everything already approved** sees the completion panel immediately, with no steps — Student A will demonstrate this in §6.3 once their items are approved.

**Storage-disabled fallback.** `/checkout/confirm` stashes the class id in `sessionStorage` before redirecting to Stripe, with a `?classID` query param as backup. In a private window with `sessionStorage` unavailable, land on `/checkout/success` with no `?classID`. Expect a **Go to your student portal** link and no crash.

**Webhook race.** The wizard must render before the enrollment row exists, because the student clicks through faster than Stripe's webhook arrives. Stop `stripe listen`, run a fresh registration, and load `/student/prerequisites/<CLASS_A_CODE>` before restarting it. Expect the steps to render normally — evaluation deliberately does not require an enrollment (§3.6 proved this at the API level). Restart `stripe listen` afterward and confirm the queued event is delivered.

**Navigation is unchanged.** `StudentNav` should still show exactly **Home**, **Certificates**, **Billing**. No new nav destination was added — the entry points are the profile card and a **Class requirements** tile on `/student`.

**Removed enrollments disappear.** Covered in §6.6 with a real removal.

**Acceptance criteria:**

- [ ] Open-redirect `next` values are rejected; only `/student/`-prefixed values are honored.
- [ ] A no-snapshot class reads **You're all set**; the storage-disabled and webhook-race paths render without crashing.
- [ ] `StudentNav` still shows exactly **Home**, **Certificates**, **Billing**.

### 4.7 Pass criteria and merge

- [ ] Payment lands on `/checkout/success` with **Continue to class requirements**, no `/admin` button.
- [ ] The `next` param survives login and OTP; the wizard opens at the class code route.
- [ ] Step count counts only outstanding required items — Student A sees fewer steps than Student B, because of an approved credential earned in §3.
- [ ] No payment language anywhere on the wizard.
- [ ] Each input type renders correctly; issue/expiration fields appear only for the right expiration rules.
- [ ] **Continue** writes a credential; **Skip for now** writes nothing.
- [ ] The profile path reopens only the skipped items and writes identically shaped rows.
- [ ] All seven status badges render; action links appear only on actionable states.
- [ ] Profile refreshes on focus, with no polling.
- [ ] Open-redirect blocked; no-snapshot class reads **You're all set**; storage-disabled and webhook-race paths do not crash.
- [ ] `StudentNav` unchanged.

Mark [BEN-686](https://linear.app/midwestern/issue/BEN-686) **Done**, then:

```bash
git checkout 684-tiered-enrollment
```

---

## 5. [BEN-684](https://linear.app/midwestern/issue/BEN-684/review-student-credentials-and-handle-re-submission) — Review student credentials and handle re-submission

**Outcome to prove:** staff can inspect submissions, approve or reject them, and a resubmission preserves a clean history rather than overwriting the record.

**Branch:**

```bash
git checkout 684-tiered-enrollment
npm run dev
```

**Migrations:** `30`, applied in §5.1.

**Inherits:** Student A and Student B both enrolled in `CLASS_A_UUID` with pending submissions (§4.3, §4.4); an admin bearer token (§1.8 — re-grab it, it has almost certainly expired).

**What is new here:** the first staff-facing prerequisite UI. `/admin/approvals` stops being a stub, and the same review panel mounts in three places.

**Leaves behind:** Student A with one rejected-then-resubmitted-then-approved credential and a preserved history. §6 needs that history intact.

### 5.1 Apply migration 30 — the corrected version

Run this in the test project's SQL Editor. **Use exactly this SQL**, which is the version on `685-tiered-enrollment`, not the one committed on this branch. The version on `684-tiered-enrollment` rebuilds `logs_action_type_check` from a hardcoded list that omits `webflow_synced` — inherited from the same mistake in migration `13` — which silently breaks Webflow sync logging. The corrected version below restores it alongside the two new values:

```sql
ALTER TABLE logs
  DROP CONSTRAINT IF EXISTS logs_action_type_check;

ALTER TABLE logs
  ADD CONSTRAINT logs_action_type_check
  CHECK (action_type IN (
    'detail_updated',
    'class_created',
    'class_deleted',
    'student_added',
    'student_removed',
    'student_registered',
    'student_deleted',
    'payment_success',
    'webflow_synced',
    'prerequisite_approved',
    'prerequisite_rejected'
  ));
```

Confirm all eleven values are present:

```sql
select pg_get_constraintdef(oid) from pg_constraint
where conrelid = 'logs'::regclass and conname = 'logs_action_type_check';
```

Expect a definition listing all eleven, including `webflow_synced`. Reviews will fail server-side on the log write without this, and the failure is swallowed as a console error rather than a visible one.

**Acceptance criteria:**

- [ ] `logs_action_type_check` lists all eleven values, including `webflow_synced`.

### 5.2 The pending queue and the review panel

Re-grab `ADMIN_TOKEN` from `/admin/login` per §1.8 if any call returns `401`.

Open `http://localhost:3000/admin/approvals`. Expect it is **no longer** the "No pending approvals" stub — it lists pending credentials newest first with student, class, prerequisite, and submitted date. Both students' pending items should be there.

```bash
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/admin/prerequisites/queue" | jq '.'
```

Expect the same set the page shows.

Click a Student A row to open the review panel, then confirm the same panel mounts at the other two entry points:

- `/admin/students/<STUDENT_A_UUID>` — one card per active enrollment.
- `/admin/classes/<CLASS_A_UUID>` — the **Prerequisites** column in the Students table.

In every one of them, expect **all four** of the class's prerequisites for that student, not just the pending one. Staff reviewing a submission need the surrounding context.

Per entry, expect: prerequisite type, submitted value, issued date, expiration date, current review status, and a line reading `Required for <class name>` or `Optional for this class`.

Values render per input type: `text` → the string; `date` → a localized date; `checkbox` → **Confirmed** / **Not confirmed**; `file_upload` → a **View file** link.

Or fetch the same payload directly:

```bash
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/api/admin/prerequisites/review?studentId=<STUDENT_A_UUID>&classId=$CLASS_A_UUID" | jq
```

Expect `success: true` with `evaluation` and `history`.

**Files are served by short-lived signed URLs.** Click **View file** on Student A's CPR credential — expect the PDF to open in a new tab. Copy that URL, wait five minutes, reopen it. Expect it to **fail**. The signed URL lifetime is 300 seconds.

Confirm no raw storage object path appears as an `href` anywhere in the panel, and no service-role key appears in any response body.

**Acceptance criteria:**

- [ ] `/admin/approvals` lists pending credentials; the same panel mounts on the student page and class page, each showing all four class prerequisites.
- [ ] `View file` opens via a signed URL and fails after 5 minutes; no raw paths or service keys leak.

### 5.3 Approve one, reject one

In the panel for Student A:

1. **Approve** `High School Graduation Date`.
2. **Reject** `Background Check Consent` with the reason `Consent form is missing a signature.`

Expect the **Reject** button to reveal an inline reason textarea, with **Confirm rejection** disabled until the reason is non-empty.

```sql
select pt.name, sc.review_status, sc.reviewed_by, sc.reviewed_at, sc.rejection_reason
from student_credentials sc
join prerequisite_types pt on pt.id = sc.prerequisite_type_id
where sc.student_id = '<STUDENT_A_UUID>' and sc.review_status in ('approved','rejected')
order by pt.name;
```

Expect the approved row to carry `reviewed_by = ADMIN_UUID`, a `reviewed_at` timestamp, and `rejection_reason` **NULL** — cleared, not left stale from an earlier decision. Expect the rejected row to carry the reviewer, the timestamp, and the exact reason text.

Expect the approved item to disappear from `/admin/approvals`.

**A blank reason is rejected:**

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  "$BASE_URL/api/admin/prerequisites/review" \
  -d '{"credentialId":"<a pending credential id>","decision":"rejected","rejectionReason":"   "}' | jq
```

Expect `A rejection reason is required.`

**Acceptance criteria:**

- [ ] Approve sets `reviewed_by`/`reviewed_at` and clears `rejection_reason`; reject stores the exact reason text.
- [ ] A blank rejection reason is rejected with the correct error.
- [ ] The approved item disappears from `/admin/approvals`.

### 5.4 The rejection email and the resubmit deep link

Check the inbox for `alexbensonux+preqA@gmail.com`. Expect an email with subject:

> Action needed: Background Check Consent

containing the reason text and a **Resubmit now** button.

```sql
select email_type, recipient_email, subject, success, created_at
from email_logs order by created_at desc limit 1;
```

Expect `prerequisite_rejected`, `alexbensonux+preqA@gmail.com`, `success = true`.

Click **Resubmit now**. Expect it to land on `/student/prerequisites/<CLASS_A_CODE>?from=profile`, and after OTP login to show the step for `Background Check Consent` with a red line reading:

> Rejected: Consent form is missing a signature.

On `/student/profile`, expect that item's badge to read **Needs resubmission** — the seventh badge, completing the set from §4.5. No separate "unsatisfied" flag is written anywhere; the status falls out of the evaluation.

**Email is non-fatal.** Temporarily set `RESEND_API_KEY` to `re_invalid` in `apps/webapp/.env.local`, restart `npm run dev`, and reject another submission. Expect the rejection to still succeed — HTTP 200, database updated, badge changed — with only a server-log error. Restore the real key and restart afterward.

**No dedup on rejection.** Reject → resubmit → reject the same prerequisite again. Expect **two** separate emails and two `email_logs` rows. Each rejection is its own event and the student needs to hear about each one.

**Escaping.** Reject something with the reason:

```
<script>alert(1)</script> & "quotes"
```

View the raw email source. Expect escaped entities rendered as literal text, with no executable tag.

**No class context still works.** A credential with `submitted_for_class_id IS NULL` must still email, reading `your class` with a **Go to my profile** button rather than a broken deep link:

```sql
update student_credentials set submitted_for_class_id = null
where id = '<some pending credential id for Student B>';
```

Reject it, check the email, then set `submitted_for_class_id` back to `CLASS_A_UUID`.

Preview the template standalone at `email-previews/prerequisite-rejected-preview.html` and confirm it matches the existing email styling.

**Acceptance criteria:**

- [ ] The rejection email sends with the correct subject and content, and logs as `prerequisite_rejected`.
- [ ] **Resubmit now** lands on the correct wizard step with the rejection reason shown.
- [ ] A broken Resend key doesn't block the rejection; repeated rejections dedupe never; HTML in the reason is escaped; a NULL class context still emails correctly.

### 5.5 Resubmit and confirm history survives

**This is the L1's core assertion.**

As Student A, resubmit `Background Check Consent` through the wizard.

```sql
select sc.id, sc.review_status, sc.rejection_reason, sc.submitted_at
from student_credentials sc
where sc.student_id = '<STUDENT_A_UUID>' and sc.prerequisite_type_id = '<BACKGROUND_TYPE_ID>'
order by sc.submitted_at;
```

Expect the rejected row now `superseded` **with its `rejection_reason` still intact**, plus a new `pending` row. Nothing deleted, nothing overwritten in place. A superseded row that lost its reason would destroy the record of why the student was asked to redo it.

In the staff panel, expect the entry to read **Pending review** with a **Show earlier submissions (1)** toggle revealing the old rejected row and its reason.

Approve the new row, then as Student A:

```bash
curl -s -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  "$BASE_URL/api/prerequisites/evaluate?classId=$CLASS_A_UUID" | jq '.evaluation.allRequiredSatisfied'
```

Expect that prerequisite to be `satisfied` and absent from `outstanding`. All three of Student A's required items should now be approved — expect `true`. Keep it that way; §6.3's material unlock depends on it.

**Acceptance criteria:**

- [ ] The rejected row becomes `superseded` with its `rejection_reason` intact; a new `pending` row is created.
- [ ] Approving the new row makes that prerequisite `satisfied`; all three of Student A's required items are now approved.

### 5.6 Authorization and error boundaries

All four new admin endpoints require a valid token **and** membership in `admins`.

```bash
curl -s -o /dev/null -w "student token: %{http_code}\n" -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  "$BASE_URL/api/admin/prerequisites/queue"

curl -s -o /dev/null -w "no token: %{http_code}\n" "$BASE_URL/api/admin/prerequisites/queue"
```

Expect `403` then `401`. Repeat both against `$BASE_URL/api/admin/prerequisites/review?studentId=<STUDENT_A_UUID>&classId=$CLASS_A_UUID` and `$BASE_URL/api/prerequisites/credentials/<CPR_CREDENTIAL_ID>/file`. The 403 body should read `Admin access required`.

**Invalid decision:**

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  "$BASE_URL/api/admin/prerequisites/review" \
  -d '{"credentialId":"<CPR_CREDENTIAL_ID>","decision":"maybe"}' | jq
```

Expect `400` with `decision must be "approved" or "rejected".`

**Superseded rows are not reviewable:**

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  "$BASE_URL/api/admin/prerequisites/review" \
  -d '{"credentialId":"<the superseded id from §5.5>","decision":"approved"}' | jq
```

Expect `409` with `This submission was replaced by a newer one.` Confirm no Approve/Reject buttons render on superseded rows in the earlier-submissions panel either.

**The reviewer identity comes from the token, never the body:**

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  "$BASE_URL/api/admin/prerequisites/review" \
  -d '{"credentialId":"<a pending id>","decision":"approved","reviewerAdminId":"<STUDENT_B_UUID>"}' \
  | jq '.credential.reviewed_by'
```

Expect `ADMIN_UUID`, not the forged value.

**Corrections are allowed.** Re-review an already-approved credential as `rejected`. Expect success, with `reviewed_by` and `reviewed_at` overwritten. Staff have to be able to fix their own mistake without making the student resubmit. Set it back to `approved` afterward.

**Acceptance criteria:**

- [ ] All four endpoints return `401`/`403` correctly for missing/non-admin tokens.
- [ ] Invalid `decision` → `400`; reviewing a superseded row → `409`; a forged `reviewerAdminId` is ignored.
- [ ] Correcting an already-reviewed credential to the opposite decision succeeds.

### 5.7 Audit trail

```sql
select action_type, reference_type, reference_id, class_id, created_at
from logs
where action_type in ('prerequisite_approved','prerequisite_rejected')
order by created_at desc limit 10;
```

Expect one row per review decision from §5.3–§5.6, `reference_type = 'student'`, `reference_id` the student's uuid. If this table is empty, migration `30` did not apply — the insert fails the CHECK constraint and the error is caught and logged rather than surfaced.

Also confirm the entries render on `/admin/students/<STUDENT_A_UUID>` in the activity log.

**No email on approve.** Approving in this L1 sends nothing — the "fully enrolled" confirmation belongs to [BEN-865](https://linear.app/midwestern/issue/BEN-865) under [BEN-685](https://linear.app/midwestern/issue/BEN-685), which is the next section. Confirm no new `email_logs` row appeared from any approval above:

```sql
select email_type, created_at from email_logs order by created_at desc limit 5;
```

Expect only `prerequisite_rejected` rows from this section.

**Acceptance criteria:**

- [ ] `prerequisite_approved`/`prerequisite_rejected` rows appear in `logs` for every review decision in this section, and render on the student's activity log.
- [ ] No email of any kind fires from an approval.

### 5.8 Pass criteria and merge

- [ ] Migration `30` applied with `webflow_synced` retained.
- [ ] `/admin/approvals` lists pending credentials; the same panel mounts on the student and class pages.
- [ ] The panel shows every class prerequisite, with per-type value rendering and required/optional context.
- [ ] `View file` opens via a 300-second signed URL and fails after expiry; no raw object paths or service keys leak.
- [ ] Approve sets reviewer, timestamp, and clears `rejection_reason`; reject stores the exact reason; blank reasons rejected.
- [ ] The rejection email sends, logs as `prerequisite_rejected`, escapes HTML, deep-links correctly, does not dedup, and does not fail the review when Resend is broken.
- [ ] Resubmission supersedes without losing the earlier `rejection_reason`; **Show earlier submissions** reveals it.
- [ ] Approving the replacement makes the item `satisfied`.
- [ ] 401/403 on all four endpoints; `maybe` → 400; superseded → 409; forged reviewer ignored; corrections allowed.
- [ ] `prerequisite_approved` / `prerequisite_rejected` land in `logs`; no email on approve.
- [ ] Student A's three required items are all `approved` heading into §6.

Mark [BEN-684](https://linear.app/midwestern/issue/BEN-684) **Done**, then:

```bash
git checkout 685-tiered-enrollment
```

---

## 6. [BEN-685](https://linear.app/midwestern/issue/BEN-685/surface-prerequisite-status-access-gating-and-communications) — Surface prerequisite status, access gating, and communications

**Outcome to prove:** prerequisite state is understandable across staff views, student views, access control, and email — without ever being confused with payment or removal.

**Branch:**

```bash
git checkout 685-tiered-enrollment
npm run dev
```

**Migrations:** none of its own. Everything sits on `24`–`30`, already applied. Migration `30` was applied in §5.1 in its corrected form, which is the version that lives on this branch — nothing to redo.

**Inherits:** Student A fully approved on `CLASS_A_UUID` (§5.5); Student B pending on everything (§4.4); `ENROLLMENT_A_UUID` (§4.2); an admin token.

**What is new here:** the staff matrix on the class page, the cross-class `/admin/follow-up` list, class-material gating, two new emails, and the static separation guardrail.

**Leaves behind:** nothing further depends on this. §7 closes out.

### 6.1 The staff matrix on the class page

`/admin/classes/<CLASS_A_UUID>` → the new **Prerequisite status by student** card, below the Students table. One row per enrolled student, one column per class prerequisite, each cell a status badge.

With Student A fully approved and Student B fully pending, expect the summary strip:

> 1 fully approved · 1 awaiting review · 0 with outstanding requirements

The three buckets are mutually exclusive and must total the row count. Confirm the filters **All** / **Outstanding** / **Pending review** / **Expiring** narrow the visible rows accordingly.

Create an outstanding row so the third bucket is exercised:

```sql
update student_credentials set review_status = 'rejected', rejection_reason = 'Illegible scan.'
where student_id = '<STUDENT_B_UUID>' and prerequisite_type_id = '<DIPLOMA_TYPE_ID>'
  and review_status = 'pending';
```

Reload — expect the strip to shift to `1 fully approved · 0 awaiting review · 1 with outstanding requirements` and Student B's cell to read **Needs resubmission**.

Then see **Expires before class starts** in the matrix:

```sql
update student_credentials set expires_at = current_date + 10 where id = '<CPR_CREDENTIAL_ID>';
```

Reload — expect Student A's CPR cell to flip to that badge. Restore afterward:

```sql
update student_credentials set expires_at = '2028-01-15' where id = '<CPR_CREDENTIAL_ID>';
```

**Removed enrollments must be absent** — verified in §6.6 with a real removal.

**One request per page load.** With the network panel open, reload the page. Expect a single call to `/api/admin/prerequisites/class-matrix?classId=…`, not one per student. A per-student fan-out here is the difference between a usable page and an unusable one on a full class.

**Views must agree.** Compare Student A's badges in this matrix against `/student/profile` as Student A. They must match exactly — both read the same evaluator through the same badge component, so any divergence is a bug rather than a display difference.

**Acceptance criteria:**

- [ ] The summary strip's three buckets are mutually exclusive, total the row count, and update correctly as underlying statuses change.
- [ ] Filters narrow rows correctly; exactly one request loads the whole matrix.
- [ ] Student A's badges here match `/student/profile` exactly.

### 6.2 The cross-class follow-up list

`/admin/follow-up` — a new sidebar item after **Approvals**. One row per student × class × flagged prerequisite, soonest class first.

Expect reason values drawn from: **Not started**, **Rejected — needs resubmission**, **Expired**, **Expires before class starts**, **Expiring soon**. Student B's rejected diploma from §6.1 should be here as **Rejected — needs resubmission**.

Check each of these:

- A **30 / 60 / 90-day window selector**, defaulting to 60, that filters **only** the **Expiring soon** rows. Rows flagged for other reasons must not appear or disappear as you change it.
- Rows within 7 days of class start are highlighted.
- **Export CSV** covers the filtered rows, not the whole set.
- Classes that have **already started** are absent. Verify by backdating:

  ```sql
  update classes set class_start_date = (current_date - interval '5 days')::date
  where id = '<CLASS_A_UUID>';
  ```

  Reload — expect its rows to disappear. Restore:

  ```sql
  update classes set class_start_date = (current_date + interval '30 days')::date
  where id = '<CLASS_A_UUID>';
  ```

- Classes with a `NULL` start date are **present**, sorted last.
- **`pending_review` items never appear here.** They belong on `/admin/approvals`. Staff's own review queue and student outreach are different work, and mixing them means chasing students who are waiting on you.
- **Optional prerequisites never generate follow-up rows.** `Emergency Contact` must not appear for anyone.

**Acceptance criteria:**

- [ ] Reason values and the 30/60/90-day window behave as specified; only **Expiring soon** rows respond to the window.
- [ ] Started classes are excluded; NULL-start-date classes are present and sorted last.
- [ ] `pending_review` items and optional prerequisites never appear.

### 6.3 Class-material gating

"Class materials" here means `classes.wf_class_link` — the existing per-class Webflow page, never previously surfaced to students. This L1 exposes it for the first time, behind the gate. No LMS was built.

Give the class a materials link:

```sql
update classes set wf_class_link = 'https://midwestea.com/classes/test-materials'
where id = '<CLASS_A_UUID>';
```

**Student B — outstanding.** As Student B, `/student/profile` → expand `CLASS_A_CODE` → the **Class materials** line. Expect a locked block:

> Class materials unlock once your required prerequisites are approved.

with the blocking item names listed.

```bash
curl -s -H "Authorization: Bearer $STUDENT_B_TOKEN" \
  "$BASE_URL/api/classes/$CLASS_A_UUID/materials" | jq '.access'
```

Expect `granted: false`, `reason: "prerequisites_incomplete"`, `materialsUrl: null`, and a populated `blockingItems`. The URL must not appear anywhere in the payload while access is denied.

**Submission does not unlock.** Have Student B resubmit the rejected diploma so everything is `pending_review` again. Reload the profile. Expect it **still locked**, now reading:

> Some items are still under review.

This is the check most likely to be wrong in an implementation, and the one that matters most — a student who has uploaded a document has not yet been cleared to attend.

**Student A — approved.** As Student A, same place. Expect an **Open class materials** button, with no admin toggle or unlock step in between.

```bash
curl -s -H "Authorization: Bearer $STUDENT_A_TOKEN" \
  "$BASE_URL/api/classes/$CLASS_A_UUID/materials" | jq '.access'
```

Expect `granted: true`, `reason: "granted"`, and `materialsUrl` set.

**Expiry re-locks on reload — nothing is cached:**

```sql
update student_credentials set expires_at = current_date - 1 where id = '<CPR_CREDENTIAL_ID>';
```

Reload as Student A. Expect locked again. Restore:

```sql
update student_credentials set expires_at = '2028-01-15' where id = '<CPR_CREDENTIAL_ID>';
```

**No materials is not a permission problem:**

```sql
update classes set wf_class_link = null where id = '<CLASS_A_UUID>';
```

As Student A (fully approved), expect:

> Materials aren't posted for this class yet.

not a locked/permission message. The API should return `reason: "no_materials"`. Restore the link afterward.

**A class with no prerequisites is open.** Check `LEGACY_CLASS_CODE` — no snapshot means nothing to satisfy.

**Optional items never block.** `Emergency Contact` is unsubmitted for both students throughout, and neither gate ever cites it.

**Staff-side view.** On `/admin/classes/<CLASS_A_UUID>`, expect a **Materials** column showing **Locked** / **Unlocked** per student — Student A unlocked, Student B locked.

**Acceptance criteria:**

- [ ] Materials stay locked while outstanding and while pending review; unlock only on full required approval with no admin step.
- [ ] `materialsUrl` is null whenever `granted: false`; access re-locks on expiry with nothing cached.
- [ ] A NULL `wf_class_link` reads as an availability message, not a permission message.
- [ ] The staff **Materials** column shows Locked/Unlocked correctly per student.

### 6.4 Emails: pending review and fully enrolled

**Pending review** fires from the Stripe webhook at registration, alongside the existing receipt.

Register a **third** time on `CLASS_A_CODE` with a fresh alias, `alexbensonux+preqC@gmail.com`, and pay with `4242 4242 4242 4242`. Expect **two** emails:

1. the existing receipt (`course_enrollment` or `program_enrollment`), unchanged; and
2. **Next steps for `<class name>`**, listing the outstanding prerequisite names with a **Complete my requirements** button.

Then register on a class with **zero** prerequisites (`LEGACY_CLASS_CODE`, if it has a payment link — otherwise set one temporarily). Expect **only** the receipt. No extra email.

**Fully enrolled** fires on the transition when the **last** required prerequisite is approved — approving one of three sends nothing.

Reject one of Student A's approved items, have Student A resubmit, then approve it. Expect exactly one email on that final approval, subject:

> You're fully enrolled in `<class name>`

with a **Go to my portal** button linking to `/student/profile`.

Confirm two things about that email: it must link to `/student/profile`, and it must contain **no** `wf_class_link` value anywhere in its body. Materials always go through the gate — an email that embeds the link routes around it permanently.

**Deduped.** Re-approve the already-approved credential:

```sql
select email_type, enrollment_id, success, created_at
from email_logs order by created_at desc limit 10;
```

Expect **no** second `fully_enrolled` row for the same `enrollment_id` — dedup is on `enrollment_id` + `email_type`.

**All three types are distinguishable** in that same query: `prerequisite_pending_review`, `fully_enrolled`, `prerequisite_rejected`, alongside the unchanged `course_enrollment` / `program_enrollment`.

**Webhook replay sends no duplicate.** Replay the `checkout.session.completed` event from the Stripe dashboard (Developers → Events → Resend). Expect no second `prerequisite_pending_review` row.

**Email failure is non-fatal in both directions.** With `RESEND_API_KEY=re_invalid`, both a registration and a review must still succeed — email is fire-and-forget. Restore the key afterward.

Previews: `email-previews/prerequisite-pending-review-preview.html` and `email-previews/fully-enrolled-preview.html`.

**Acceptance criteria:**

- [ ] A prerequisite-bearing registration sends receipt + **Next steps**; a zero-prerequisite registration sends receipt only.
- [ ] `fully_enrolled` fires exactly once, on the last required approval, and never embeds `wf_class_link`.
- [ ] Re-approval and webhook replay produce no duplicate emails; a broken Resend key fails neither the registration nor the review.

### 6.5 Payment and prerequisite state stay separate

This is the guardrail the whole feature rests on, and it is checked in both directions plus statically.

**Prerequisite activity must not touch payment.** Snapshot:

```sql
select id, transaction_status, amount_paid, amount_due, refund_amount, refund_percentage
from transactions where enrollment_id = '<ENROLLMENT_A_UUID>' order by id;
```

Run a full submit → reject → resubmit → approve cycle on Student A. Re-run the query. The result set must be **byte-identical**.

**Payment activity must not touch prerequisites.** Snapshot:

```sql
select id, review_status, reviewed_at, expires_at
from student_credentials where student_id = '<STUDENT_A_UUID>' order by id;
```

Pay an outstanding invoice through `/student/billing` in the normal way. Re-run. Identical.

**`onboarding_complete` was not repurposed:**

```sql
select onboarding_complete from enrollments where id = '<ENROLLMENT_A_UUID>';
```

Unchanged before and after the review cycle. That existing field is not a prerequisite flag.

**Prerequisite state never blocks payment.** With Student B's prerequisites `missing` or `rejected`, paying an invoice on `/student/billing` must complete normally.

**Both states are visible together, and clearly distinct.** On `/student/profile`, expect a **Payment: `<status>`** line beside the requirements summary. On `/admin/classes/<CLASS_A_UUID>`, expect the **Invoice Status** and **Prerequisites** columns side by side.

**The static check:**

```bash
cd apps/webapp && npm run verify:separation
```

Expect exit `0`. This fails the build if prerequisite code reads payment state, if payment code reads prerequisite state, or if prerequisite code **writes** `enrollment_status` / `transaction_status` / `refund_*`. Reading `enrollment_status` is allowed and expected — several of the surfaces above use it to exclude removed students.

Prove the check actually bites, rather than passing vacuously. Add this line temporarily to `apps/webapp/lib/class-access.ts`:

```ts
const amount_due = 0;
```

Re-run `npm run verify:separation` — expect a **non-zero** exit naming the file and the term. Remove the line and confirm it returns to `0`. **Revert this before moving on** — it is the only edit anywhere in this document, and leaving it in would break the branch.

**No surface may imply a false link.** Read the wizard, the profile, the locked-materials block, and all three emails once more. None may suggest that materials are locked because of payment, that money is owed because of a prerequisite, or that removal follows from prerequisite state.

**Acceptance criteria:**

- [ ] Transaction and credential snapshots are byte-identical across each other's full submit/review and payment cycles; `onboarding_complete` is untouched.
- [ ] Payment succeeds on `/student/billing` regardless of prerequisite state.
- [ ] `npm run verify:separation` exits `0`, and exits non-zero when deliberately broken — with the break reverted afterward.
- [ ] No surface implies a false link between payment, prerequisites, and removal.

### 6.6 Removal, refund, and restore stay manual

Rejecting or expiring a prerequisite must never remove a student or trigger a refund.

```sql
select enrollment_status from enrollments where id = '<ENROLLMENT_A_UUID>';
```

After all the rejections above, expect still `registered`, with transactions unchanged per §6.5.

Confirm that `/admin/follow-up`, the class matrix, and the review panel offer **no** Remove / Refund / Withdraw / Cancel control anywhere. The only removal entry point remains the existing modal on `/admin/classes/<CLASS_A_UUID>`.

**The remove modal is unchanged, plus context.** Open it for Student A. Expect the refund percentage field, defaults, and validation exactly as before, now with a **read-only** prerequisite context block and the disclaimer:

> Requirement status is shown for context only. It does not affect removal or refund.

It must **never** prefill the refund percentage from prerequisite state.

**Credentials survive removal.** Snapshot:

```sql
select id, review_status, expires_at from student_credentials
where student_id = '<STUDENT_A_UUID>' order by id;
```

Remove Student A with a 50% refund through the modal. Re-run the snapshot — **identical**. Then confirm the removal itself did apply:

```sql
select enrollment_status from enrollments where id = '<ENROLLMENT_A_UUID>';
select transaction_status, refund_percentage, refund_amount
from transactions where enrollment_id = '<ENROLLMENT_A_UUID>';
```

Expect `removed`, and the refund stamped on the previously-paid rows.

Reload `/admin/classes/<CLASS_A_UUID>` — Student A must now be **absent** from the prerequisite matrix, and from `/admin/follow-up`. Check `/student/profile` as Student A — the removed class disappears from the class list.

**Restore recovers state with no repair step.** Restore the enrollment through the same modal. Expect Student A's prerequisite statuses to return exactly as they were, with no re-submission and no repair — evaluation is derived from credentials rather than cached on the enrollment, so there is nothing to rebuild.

**Acceptance criteria:**

- [ ] No removal/refund control appears on any prerequisite surface; the existing remove modal is unchanged aside from read-only context and never prefills the refund percentage.
- [ ] Credentials survive removal unchanged; the removed student disappears from staff and student surfaces.
- [ ] Restoring the enrollment recovers prerequisite state with no repair step.

### 6.7 Pass criteria and merge

- [ ] The class matrix shows one row per enrolled student with correct badges; the summary strip's three buckets are exclusive and total the rows; filters work; one request per load.
- [ ] `/admin/follow-up` lists the right reasons, windows only **Expiring soon**, highlights <7 days, exports the filtered set, hides started classes, sorts NULL start dates last, and excludes both `pending_review` and optional items.
- [ ] Materials stay locked while outstanding **and** while pending review; unlock on the last required approval with no admin step; re-lock on expiry; `no_materials` reads as an availability message, not a permission one; the URL never appears in a denied payload.
- [ ] Registration on a class with prerequisites sends receipt + **Next steps**; zero-prerequisite class sends receipt only.
- [ ] `fully_enrolled` fires once, on the last required approval, deduped, linking to `/student/profile` and never embedding `wf_class_link`.
- [ ] Webhook replay produces no duplicate email; a broken Resend key fails neither registration nor review.
- [ ] Payment and prerequisite snapshots are byte-identical across each other's full cycles; `onboarding_complete` untouched; payment works with prerequisites missing.
- [ ] `npm run verify:separation` exits `0`, and exits non-zero when deliberately broken — with the deliberate break reverted.
- [ ] Rejection never removes or refunds; no removal control on any new surface; the remove modal is unchanged aside from read-only context.
- [ ] Credentials survive removal; removed students vanish from staff and student surfaces; restore recovers state with no repair.
- [ ] Staff and student views agree for the same student everywhere.

Mark [BEN-685](https://linear.app/midwestern/issue/BEN-685) **Done**.

---

## 7. Close-up

All five L1s are Done. This section merges the chain, restores your environment, and lists everything production needs.

### 7.1 Merge the chain

The branches are stacked, so each merge is a fast-forward. Merge **downward**, oldest first, and stop at the first one that is not clean.

Confirm the working tree is clean before you start — in particular that §6.5's deliberate edit to `apps/webapp/lib/class-access.ts` is reverted:

```bash
git status --short
```

Expect no output.

```bash
git checkout tiered-invoicing
git merge --ff-only 687-tiered-enrollment
git merge --ff-only 683-tiered-enrollment
git merge --ff-only 686-tiered-enrollment
git merge --ff-only 684-tiered-enrollment
git merge --ff-only 685-tiered-enrollment
```

Each should report `Fast-forward`. If any reports a non-fast-forward, stop — something diverged since this plan was written, and merging with a commit would need a look first.

Confirm you landed where you expect:

```bash
git log --oneline -1
git diff --stat 685-tiered-enrollment
```

Expect the last commit of `685-tiered-enrollment` and an empty diff.

**Pushing is a separate decision.** Nothing here pushes. When you want the merge on the remote, run it yourself.

**Acceptance criteria:**

- [ ] The working tree was clean before merging (no leftover §6.5 edit).
- [ ] All five `git merge --ff-only` calls reported `Fast-forward`.
- [ ] `git diff --stat 685-tiered-enrollment` is empty after merging.

### 7.2 Restore your environment

```bash
cp apps/webapp/.env.local.backup apps/webapp/.env.local
grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_URL)=' apps/webapp/.env.local
```

Expect both to show the **live** project ref, not `TEST_PROJECT_REF`. If they still show the test project, the backup was taken after the swap rather than before — recover the live values from Supabase Settings → API and set them by hand.

Stop `stripe listen` and `npm run dev` (Ctrl-C in each terminal).

Note that the restored file has **no Stripe keys** — that is how it started, and §1.4 added them only to the working copy. If you want them for future local work, re-add them after restoring rather than keeping the test file.

Clear the test tokens from your shell:

```bash
unset ADMIN_TOKEN STUDENT_A_TOKEN STUDENT_B_TOKEN
```

**Acceptance criteria:**

- [ ] `.env.local` is restored from the backup and points at the live project, not the test one.
- [ ] `stripe listen` and `npm run dev` are stopped; test tokens are cleared from the shell.

### 7.3 Promote to the live environment

Nothing in this pass touched production. Everything below has to happen for the merged work to function there.

**Migrations — run in this exact order against the live Supabase project.** Seven files, all in `supabase/migrations/`:

| Order | File | Creates |
| -- | -- | -- |
| 1 | `24_create_prerequisite_types.sql` | `prerequisite_types` + RLS |
| 2 | `25_add_prerequisite_type_details.sql` | detail columns + expiration CHECK |
| 3 | `26_create_template_prerequisites.sql` | `template_prerequisites` |
| 4 | `27_create_class_prerequisites.sql` | `class_prerequisites` |
| 5 | `28_create_student_credentials.sql` | `student_credentials`, `latest_student_credentials`, the private `student-credentials` bucket |
| 6 | `29_compute_credential_validity.sql` | `compute_credential_expiry()` + backfill |
| 7 | `30_allow_prerequisite_review_log_actions.sql` | extends `logs_action_type_check` |

Use the version of `30` from `685-tiered-enrollment` (the one that retains `webflow_synced`). After merging, that is simply the file on disk.

Then run the same verification queries from §1.5 and §3.1 against production: three tables, the view, the function, and the bucket with `public = false`.

**Storage.** Migration `28` creates the `student-credentials` bucket via an `INSERT` into `storage.buckets` with `ON CONFLICT DO NOTHING`. Confirm in the live dashboard that it exists and is **private**. If a public bucket of that name already exists, the insert silently does nothing and every uploaded credential becomes world-readable — check this explicitly rather than assuming.

**Environment variables** — set wherever the production app reads its config (Vercel project settings, or the Webflow Cloud env vars documented in `docs/webflow-cloud-env-vars.md`):

- `NEXT_PUBLIC_BASE_URL` — must be the production origin. All three new emails deep-link with it; a stale value sends every student to the wrong host.
- `RESEND_API_KEY` — already required for existing emails, but the three new templates make it load-bearing for the prerequisite flow too.

**Stripe.** No new Stripe objects are needed for the prerequisite work itself. But `/checkout/confirm` reads `classes.stripe_payment_link`, and every class's link must have its **After payment** redirect pointing at the production `/checkout/success` — otherwise students pay and never reach the requirements wizard. Audit the links on live classes:

```sql
select class_id, class_name, stripe_payment_link
from classes
where class_start_date >= current_date and stripe_payment_link is not null
order by class_start_date;
```

Check each link's redirect setting in the live Stripe dashboard.

**Content setup after deploy.** The feature ships empty. Before it does anything for anyone:

1. Seed `/admin/prerequisites` with the real prerequisite types.
2. Assign them on each program and course template.
3. Understand that **only classes created after this point receive a snapshot.** There is deliberately no backfill — existing classes will read `No prerequisites on this class.` indefinitely. If prerequisites are needed on an already-created class, that is a separate piece of work, not a deploy step.
4. Confirm `classes.wf_class_link` is populated on classes that should offer materials. A NULL reads as `Materials aren't posted for this class yet.`

**Acceptance criteria:**

- [ ] All seven migrations are applied against production in order, and the verification queries confirm each artifact, including the private `student-credentials` bucket.
- [ ] `NEXT_PUBLIC_BASE_URL` and `RESEND_API_KEY` are correct in the live environment.
- [ ] Every live class's payment link redirects to the production `/checkout/success`.
- [ ] The real prerequisite catalog is seeded and assigned to live templates.

### 7.4 Dispose of the test resources

- The Supabase test project (`TEST_PROJECT_REF`) can sit there for the next pass or be deleted from the dashboard. It was never wired into anything shared — but it does hold a clone of real student PII from §1.2, so deleting it is the safer default.
- Delete the throwaway classes created in §2.6, §2.7, and the extra registration in §6.4 only if you keep the project.
- The Stripe test-mode Product, Price, and Payment Link are test-mode only and cost nothing to leave in place.
- Delete `apps/webapp/.env.local.backup` once you have confirmed §7.2 restored correctly.

**Acceptance criteria:**

- [ ] A decision has been made and acted on for the test Supabase project, the throwaway classes, and the local `.env.local.backup`.
