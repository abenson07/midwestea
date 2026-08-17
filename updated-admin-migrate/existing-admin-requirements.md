# Existing Admin Requirements & Dummy Demo Content

Source: the live admin at `http://localhost:3002` (`apps/webapp`), **not** the `updated-admin-migrate` demo. Captured 2026-08-16.

This file has two parts:

1. **Page requirements** — functionality that already exists on each page
2. **Dummy demo content** — catalog rows to copy into the demo

---

## Part 1 — Page requirements

### Class detail

**Route:** `/admin/classes/[id]`  
Example: `/admin/classes/{uuid}?from=course&courseId=…` or `?from=program&programId=…`

#### Header
- Back link depends on how the admin arrived:
  - from a course template → “Back to {course name}”
  - from a program template → “Back to {program name}”
  - otherwise → “Back to Classes”
- Optional “View on site” link to the public marketing page (course code + class id)
- Title is the human class ID (e.g. `EMT-002`); subtitle is the class name
- **Edit** opens the create/edit class modal

#### Class details (read-only card)
Show:
- Class name, class ID, course code
- Online (Yes/No)
- Location
- Enrollment start / enrollment close
- Class start / class end
- Length of class
- Registration limit
- Certification length
- Price
- Registration fee

Dates that are stored as `YYYY-MM-DD` must display as that calendar date (not shifted by timezone). Timestamp dates display in America/Chicago.

#### Edit / create class modal
Used from class detail (edit + delete), the classes list, and course/program templates (create).

Fields:
- **Program or course** (required). Locked when editing. On the classes list, grouped as Programs / Courses. Selecting a template inherits price, registration fee, cert length, registration limit, and class type.
- **Class type** (required): In Person Only, Hybrid, Online + Skills Training, In Person + Homework, Online Only. Online Only / Online + Skills Training mark the class as online.
- **Location** — only for In Person Only, Hybrid, In Person + Homework. Options come from the Locations catalog, plus “No location”.
- **Price**, **Reg fee**, **Cert length**, **Reg limit** — inline badge editors. Registration fee is hidden when the parent is a course (not a program). Registration limit (and enrollment/class dates) are hidden for Online Only / Online + Skills Training.
- **Enrollment open / close**, **Class start / end** — date inputs, hidden for those online types. On create, enrollment close auto-fills to 21 days before class start if empty. Enrollment open defaults to today on create.

Actions:
- Save / Create
- **Delete** (edit only) with confirmation. After delete, go back to the parent course, parent program, or classes list.

Creating a class generates a class ID as `{course_code}-{NNN}` (next 3-digit number for that code) and copies the template’s prerequisite list onto the class. Later edits to the template do **not** change that class’s list.

#### Prerequisites (read-only on the class)
- Copied from the template at class creation. Helper copy says editing the template does not change this list.
- Table: Prerequisite name, Input type, Required (Yes/No)
- Empty state: “No prerequisites on this class.”

#### External learning links
- JB Learning label + URL
- Platinum ED label + URL
- Class can override; otherwise inherits from the parent course/program (shown as “Inherits from course” / platform default)
- Edit in a sidebar and save

#### Students (roster)
- Table: Name, Email, Invoice Status, Prerequisites, Remove
- Row click → student profile
- **Invoice Status** is a button that opens a sidebar of that enrollment’s invoices. Values:
  - No invoices yet
  - Pending
  - Partially paid
  - All paid (green)
  - Past due (red)
- **Prerequisites** is a button that opens a per-student review sidebar:
  - “N to review” (amber) if any required items are not satisfied
  - “All complete” (green) otherwise
- Empty state when nobody is enrolled

**Add Student** (sidebar):
- Search existing students by name or email (excludes people already in the class) and enroll them as `registered`
- Or create a new student (name*, email*, phone) and enroll them in one step
- Enrollment is logged

**Remove student** (modal):
- Confirm removal; can be undone immediately via undo toast
- Shows outstanding prerequisite items for context only (does not change refund behavior)
- If the student has paid invoices, require a refund percentage 0–100 (presets 100% / 50% / 0%) and show paid total. Copy explains refunds are case-by-case.
- Calls remove-enrollment API; undo calls restore-enrollment API

#### Prerequisite status by student (matrix)
- Summary counts: fully approved · awaiting review · outstanding requirements
- Filters: All, Outstanding, Pending review, Expiring (with counts)
- Grid: student rows × prerequisite-type columns (required marked `*`) plus a Materials column (Unlocked / Locked)
- Each cell is a status badge; click opens the same student/class prerequisite review sidebar

#### Prerequisite review (sidebar, reused on student profile and Approvals)
For each class prerequisite:
- Name + status badge
- Submitted value (text, date, checkbox confirmed/not, or “View file” for uploads)
- Issued date, expires date (“Never” if none)
- Required vs optional for this class
- Rejection reason if rejected
- **Approve** / **Reject** (reject requires a reason)
- Expand earlier submissions and review those too
- File view goes through an app proxy so expired signed URLs don’t dump a raw storage error

Statuses: Approved, Expired, Pending review, Needs resubmission, Not started, Optional, Expires before class starts

#### Activity log
- Chronological audit log for this class (field edits, enrollments, etc.)

---

### Course template

**Route:** `/admin/courses/[id]`  
Example: `http://localhost:3002/admin/courses/188cc201-0633-4d72-9612-a044350088a2`

#### Header
- Back to Courses
- “View on site” marketing link
- Title = course name, subtitle = course code
- **Edit** opens a sidebar (`?edit=true`)

#### Course details (read-only)
- Course name, course code
- Length of class, registration limit, certification length
- Price
- Registration fee only if `program_type === 'program'` (course templates normally hide this)

#### Prerequisites (editable template list)
Helper copy: classes created from this course copy this list; existing classes keep the list they were created with.

For each assigned type:
- Name, input type, expiration summary
- Toggle **Required**
- Reorder up/down
- Remove (confirm: existing classes keep theirs)

**Add a prerequisite:** typeahead against the global catalog. If nothing matches, create a new type (name + input type) and attach it.

#### External learning links
Same card as class detail, saved on the course (no inherit).

#### Classes **or** waitlist
- If this course has classes: table of Class ID, Class Name, Start, End, Online. Row click → class detail with `from=course`. **Add Class** opens the class modal preselected to this course.
- If this course has **no** classes: show **Waitlist** instead (Full Name, Email, Signed Up). No add-class button in that empty-classes branch.

#### Edit sidebar
- Course name (editable)
- Course code (read-only; classes depend on it)
- Class type (same five offerings)
- Course image URL
- Length of class + registration limit (hidden for Online Only / Online + Skills Training)
- Cert. length
- Price ($)
- Stripe Product ID (read-only)
- Save logs field-level changes to the activity log

#### Activity log
- Course-scoped audit log

---

### Program template

**Route:** `/admin/programs/[id]`  
Example: `http://localhost:3002/admin/programs/45fb62c2-b848-427f-a380-11ff306186ed`

Same shape as the course template, with these differences:

- Labels say Program / Program code / Program details
- Details card always shows **Price** and **Registration fee**
- Edit sidebar always includes Reg. Fee ($)
- Class modal is preselected to this program; class rows navigate with `from=program`
- Waitlist empty state copy says “this program”
- Activity log `reference_type` is `program`

Prerequisite assignment, external links, add-class, and waitlist-when-no-classes behave the same as the course template.

---

### Student profile

**Route:** `/admin/students/[id]`

#### Header
- Back to Students
- Title = student name, subtitle = email
- **Edit** sidebar (`?edit=true`)
- **Delete Student** with confirmation — permanently removes the student record and auth account (not undoable)

#### Student details (read-only)
- Name, email, phone
- T-shirt size
- Emergency contact name / phone
- Has required info (Yes/No)
- Stripe customer ID

#### Edit sidebar
- Full name, email, phone (phone formatted), t-shirt size, emergency contact name/phone
- Has required info checkbox
- Save logs field-level changes

#### Prerequisites
- One review card per **active** enrollment (status not `removed`)
- Same approve/reject/file/history UI as class detail

#### Classes
- Table of active enrollments: Class ID, Class Name, Enrolled Date, Payment Status
- Class ID/name link toward class
- Payment status is enrollment-level, using registration_fee / tuition_a / tuition_b:
  - Registration fee past due / Tuition A past due / Tuition B past due
  - All paid
  - First payment paid (reg fee + tuition A paid, tuition B not)
  - Registration fee paid
  - Pending
  - No payments yet

#### Invoices by class
- Payments grouped by enrollment/class
- Columns: Amount, Status, Paid At / Due Date (Paid date, or Cancelled/Refunded/Past due/Pending badges), Next Due Date
- Clicking a group opens an enrollment sidebar: class info + invoice cards
- If the group has any **pending** invoices: **Void & Reissue**
  - Voids open invoices and creates replacement invoices (amount + due date per row)
  - Add more replacement invoices
  - **Pay in Full** collapses to one invoice for the original open total, due today
  - Shows original total vs new total
  - Confirm posts to void-and-reissue API

#### Activity log
- Student-scoped logs plus enrollment/payment actions for that student

---

### Transactions

**Route:** `/admin/payments` (nav label: Transactions)

#### List
- Title “Transactions” / “List of transactions”
- Table: Invoice Number, Student Name, Student Email, Class ID, Type, Amount Due, Status, Due Date
- Row click opens a detail sidebar (`?transactionId=`)
- Status filter: All, Open (unpaid), Past due, Paid, Cancelled, Refunded
- Display status is derived: paid / cancelled / refunded stay as stored; unpaid + due date in the past → **Past due**; otherwise **Pending**
- Types: Registration Fee, First Invoice (`tuition_a`), Second Invoice (`tuition_b`), Custom Invoice, Pay in Full
- Amount due = `amount_due × quantity` (legacy program invoices often use quantity `0.5` for each tuition half)
- If a discount was applied, an “i” tooltip shows percent or dollar off the original

#### Detail sidebar
Always:
- Invoice number, amount due, status, type, due date
- Student name (link to profile), student email, class ID

If status is **pending**:
- Edit due date (saved as end-of-local-day)
- **Send Reminder** (payment reminder email, with confirm)
- **Adjust Amount**: discount % **or** set a dollar amount directly

If not paid and not cancelled:
- **Mark as Paid**
- **Cancel Invoice** (confirm)

---

### Locations

**Route:** `/admin/locations`

- Table: Name, Street, City, State, Zip, Maps URL (opens in a new tab)
- Row **Edit** and page-level **Add location**
- Modal fields: Location name* , Street, City, State, Zip, Google Maps URL
- Create and update only (no delete on this page)
- Empty state: “No locations yet. Add one to get started.”

Locations are the options on the class create/edit location dropdown.

---

### Prerequisites

**Route:** `/admin/prerequisites`

Global catalog of reusable types for programs, course templates, and classes.

- Table: Name, Input type, Required, Expiration, Created, Actions (Edit / Archive)
- **Add prerequisite** / Edit in a sidebar
- Archive confirm: “It stays on classes that already use it.” Archived types drop off this list.

#### Type form
- Name*
- Input type: File upload, Date, Text, Checkbox
- Description (shown to students when they complete it)
- Required by default (templates can override per assignment)
- Expiration:
  - Never expires
  - Expiration date provided by student (`fixed_date`)
  - Expires a set number of months after the issue date (`duration_from_issue`) — requires “Valid for (months)” ≥ 1

Expiration column labels: Never / Student-provided date / “N months”

---

### Follow-up

**Route:** `/admin/follow-up`

Cross-class list of students with incomplete or expiring prerequisites before class starts.

- Reason chips (all on by default; toggle to filter):
  - Rejected — needs resubmission
  - Expired
  - Expires before class starts
  - Not started
  - Expiring soon
- **Expiring soon window:** 30 / 60 / 90 days (only rows whose expiry is within that window)
- Count: “N of M items”
- Table: Student, Class, Starts (date + days until class), Prerequisite, Reason, Actions
- Rows with class starting in ≤ 7 days are highlighted
- Expiring soon shows “Expires in Nd”; other reasons use the status badge
- Actions: View class, View student
- **Export CSV** of the filtered rows (Student, Email, Class, Class start, Prerequisite, Reason, Expires)
- Empty: “No follow-up needed right now.”

---

### Approvals

**Route:** `/admin/approvals`

Queue of prerequisite **submissions awaiting review**.

- Table: Student, Class, Prerequisite, Submitted (date)
- Row click opens the student/class review sidebar (approve / reject / view file / history)
- After a review action, the queue reloads
- If a submission isn’t tied to a class, the sidebar says so instead of loading review
- Empty: “No submissions awaiting review.”

---

## Part 2 — Dummy demo content

Pulled from the live admin lists (same DB the localhost:3002 admin uses). Use these as the demo catalog. Student names/emails are omitted from transactions.

Online **courses** typically store the student-facing price in **Reg. fee** and leave **Price** empty. **Programs** have tuition in **Price** plus a registration fee.

### Courses (from `/admin/courses`)

| Code | Name | Class type | Cert. length | Limit | Price | Reg. fee |
| --- | --- | --- | --- | --- | --- | --- |
| ACLS | Advanced Cardiovascular Life Support (ACLS) | Online + Skills Training | 1 | 25 | — | $149.99 |
| AVERT | Active Violence Emergency Response Training | Online + Skills Training | 1 | — | — | $39.99 |
| BLS | Basic Life Support | Online + Skills Training | 1 | — | — | $49.99 |
| CABS | Child & Babysitting Safety | Online Only | 1 | — | — | $34.99 |
| CPR | CPR / First Aid | Online + Skills Training | 1 | — | — | $34.99 |
| EPI | Use and Administration of Epinephrine Auto-Injectors | Online Only | 1 | — | — | $35.00 |
| OXY | Emergency Use of Medical Oxygen | Online Only | 1 | — | — | $19.99 |
| PALS | Pediatric Advanced Life Support (PALS) | Online Only | 1 | — | — | $34.99 |
| PATH | Bloodborne Pathogens | Online Only | 1 | — | — | $19.99 |
| PEDS | Pediatric CPR & First Aid | Online Only | 1 | — | — | $34.99 |

### Programs (from `/admin/programs`)

| Code | Name | Class type | Length | Limit | Price | Reg. fee |
| --- | --- | --- | --- | --- | --- | --- |
| AEMT | Advanced Emergency Medical Technician | Hybrid | 12 weeks | 25 | $5,600.00 | $100.00 |
| ATCC | Advanced Tactical Casualty Care | In Person Only | 3 days | 25 | $1,650.00 | $100.00 |
| CCT | Critical Care Transport | In Person + Homework | 3 weeks | 25 | $1,650.00 | $100.00 |
| CP | Community Paramedic | Hybrid | 2 weeks | — | $1,000.00 | $50.00 |
| EMR | Emergency Medical Responder | Online + Skills Training | — | — | $750.00 | $50.00 |
| EMT | Emergency Medical Technician | Hybrid | 12 weeks | 25 | $2,150.00 | $50.00 |
| PARA | Paramedic Program | Hybrid | 1 year | 25 | $8,800.00 | $150.00 |

### 10 classes (from `/admin/classes`)

Chosen to mix online courses and in-person programs. The live list has 21 classes; these 10 are enough for the demo.

| Class ID | Name | Course code | Start | End | Online | Location | Price | Reg. fee | Limit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ACLS-001 | Advanced Cardiovascular Life Support (ACLS) | ACLS | — | — | Yes | — | — | $149.99 | 25 |
| AEMT-001 | Advanced Emergency Medical Technician | AEMT | 2026-08-19 | 2027-02-19 | No | Topeka, KS | $5,600.00 | $100.00 | 25 |
| ATCC-001 | Advanced Tactical Casualty Care | ATCC | 2026-10-05 | 2026-10-10 | No | — | $1,650.00 | $100.00 | 25 |
| BLS-001 | Basic Life Support | BLS | — | — | Yes | — | — | $49.99 | — |
| EMT-002 | Emergency Medical Technician | EMT | 2026-07-18 | 2026-10-10 | No | Raytown, MO | $2,150.00 | $50.00 | 25 |
| EMT-003 | Emergency Medical Technician | EMT | 2026-06-06 | 2026-09-12 | No | Lawrence | $2,150.00 | $50.00 | 25 |
| OXY-001 | Emergency Use of Medical Oxygen | OXY | — | — | Yes | — | — | $19.99 | — |
| PARA-001 | Paramedic Program | PARA | 2026-01-12 | 2027-01-12 | No | — | $8,800.00 | $150.00 | 25 |
| PARA-002 | Paramedic Program | PARA | 2026-08-27 | 2027-08-27 | No | — | $8,800.00 | $300.00 | 25 |
| PARA-003 | Paramedic Program | PARA | 2026-09-05 | — | No | — | $8,800.00 | $150.00 | 25 |

Other live classes not in the 10: `AVERT-001`, `CABS-001`, `CPR-001`, `EMT-001`, `EMT-004`, `EMT-005`, `EPI-001`, `PALS-001`, `PARA-004`, `PATH-001`, `PEDS-001`.

### Students (made up for the demo)

15 fictional students. Some are in one class; some are in a program plus a related cert course.

| Name | Email | Enrolled in |
| --- | --- | --- |
| Maya Ellison | maya.ellison@example.com | BLS-001 |
| Jordan Hale | jordan.hale@example.com | EMT-002 |
| Priya Shah | priya.shah@example.com | EMT-002, BLS-001 |
| Caleb Ortiz | caleb.ortiz@example.com | EMT-003 |
| Hannah Briggs | hannah.briggs@example.com | PARA-001, ACLS-001 |
| Malik Reeves | malik.reeves@example.com | PARA-002 |
| Elise Navarro | elise.navarro@example.com | PARA-003, ACLS-001, BLS-001 |
| Drew Kim | drew.kim@example.com | AEMT-001 |
| Sofia Alvarez | sofia.alvarez@example.com | ATCC-001, ACLS-001 |
| Nathan Brooks | nathan.brooks@example.com | OXY-001, BLS-001 |
| Riley Chen | riley.chen@example.com | EMT-003, OXY-001 |
| Amber Patel | amber.patel@example.com | PARA-002, ACLS-001 |
| Luis Mendoza | luis.mendoza@example.com | AEMT-001, BLS-001 |
| Grace Whitaker | grace.whitaker@example.com | EMT-002 |
| Owen Fraser | owen.fraser@example.com | PARA-001 |

Roster by class (for filling class detail pages):

| Class ID | Students |
| --- | --- |
| ACLS-001 | Hannah Briggs, Elise Navarro, Sofia Alvarez, Amber Patel |
| AEMT-001 | Drew Kim, Luis Mendoza |
| ATCC-001 | Sofia Alvarez |
| BLS-001 | Maya Ellison, Priya Shah, Elise Navarro, Nathan Brooks, Luis Mendoza |
| EMT-002 | Jordan Hale, Priya Shah, Grace Whitaker |
| EMT-003 | Caleb Ortiz, Riley Chen |
| OXY-001 | Nathan Brooks, Riley Chen |
| PARA-001 | Hannah Briggs, Owen Fraser |
| PARA-002 | Malik Reeves, Amber Patel |
| PARA-003 | Elise Navarro |

### Locations (from `/admin/locations`)

| Name | Street | City | State | Zip | Maps |
| --- | --- | --- | --- | --- | --- |
| Eudora, KS | — | — | — | — | — |
| Lawrence | 300 w 31st St | Lawrence | KS | 66046 | [Google Maps](https://www.google.com/maps/place/Consolidated+Fire+District+1,+Station+111/@38.929817,-95.2416805,17z/data=!3m1!4b1!4m6!3m5!1s0x87bf68972fbcf8d5:0x18a0ce22bebb5787!8m2!3d38.929817!4d-95.2391056!16s%2Fg%2F1tr18282) |
| Pleasant Valley, MO | 8108 Pleasant Valley Rd | Pleasant Valley | MO | 64068 | [Google Maps](https://www.google.com/maps/place/Pleasant+Valley+Fire+Department/@39.217056,-94.4847821,17z/data=!3m1!4b1!4m6!3m5!1s0x87c0ff4b274bf501:0xe209d302b9b08cdb!8m2!3d39.217056!4d-94.4822072!16s%2Fg%2F1w2yzzl7) |
| Raytown, MO | 10020 E 66 Terrace | Raytown | MO | 64133 | [Google Maps](https://www.google.com/maps/place/10020+E+66+Terrace,+Raytown,+MO+64133/@39.0037199,-94.4649156,571m/data=!3m1!1e3!4m9!1m2!2m1!1sRaytown+Fire+Protection+District+Station+53!3m5!1s0x87c0e3ebb7b32677:0x7d55411cb2c915b1!8m2!3d39.0030098!4d-94.4624367!16s%2Fg%2F11c193mfhn) |
| Topeka, KS | — | — | — | — | — |

### Prerequisites (from `/admin/prerequisites`)

| Name | Input type | Required by default | Expiration |
| --- | --- | --- | --- |
| Background Check Consent | Checkbox | Yes | Never |
| CPR Certification | File upload | Yes | 24 months from issue |
| Emergency Contact | Text | Yes | Never |
| High School Graduation Date | Date | Yes | Never |
| Immunization Record | File upload | Yes | Student-provided date |
| Test | Date | Yes | Never |

`Test` is on the live catalog; skip it in the demo if you only want real types.

Emergency Contact description: “Enter the name and contact information for your emergency contact.”

### Transactions (from `/admin/payments`)

The live admin currently has **10** invoices (no student names included here):

| Invoice | Type | Status | Amount | Due | Class ID | Class | Course |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 110 | Registration Fee | Paid | $49.99 | 2026-08-15 | BLS-001 | Basic Life Support | BLS |
| 109 | First/Second Invoice (`tuition_b`) | Pending | $4,400.00 | 2026-09-12 | PARA-003 | Paramedic Program | PARA |
| 108 | First Invoice (`tuition_a`) | Pending | $4,400.00 | 2026-08-15 | PARA-003 | Paramedic Program | PARA |
| 107 | Registration Fee | Paid | $150.00 | 2026-08-15 | PARA-003 | Paramedic Program | PARA |
| 106 | `tuition_b` | Pending | $4,400.00 | 2026-09-12 | PARA-003 | Paramedic Program | PARA |
| 105 | `tuition_a` | Refunded | $4,400.00 | 2026-08-15 | PARA-003 | Paramedic Program | PARA |
| 104 | Registration Fee | Refunded | $150.00 | 2026-08-07 | PARA-003 | Paramedic Program | PARA |
| 103 | `tuition_b` | Pending | $4,400.00 | 2026-09-12 | PARA-003 | Paramedic Program | PARA |
| 102 | `tuition_a` | Paid | $4,400.00 | 2026-08-15 | PARA-003 | Paramedic Program | PARA |
| 101 | Registration Fee | Paid | $150.00 | 2026-08-06 | PARA-003 | Paramedic Program | PARA |

Program tuition is typically split as two `$4,400` halves of the `$8,800` PARA price (quantity `0.5` in the DB). The demo already has a larger synthesized transaction set in `src/data/mocks/transactions.ts` if you need more rows for filters/scroll; the table above is what the live Transactions page actually contains right now.
