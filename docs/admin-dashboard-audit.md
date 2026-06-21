# Admin Dashboard Audit — User Stories by Page

Audit of the current admin dashboard (`/admin` in `apps/webapp`). Use as a checklist against the new design to confirm 100% functional parity.

**Location:** `apps/webapp/app/(platform)/admin/`  
**Public URL base:** `/admin`

---

## Legend

| Status | Meaning |
|--------|---------|
| **Live** | Implemented and working today |
| **Partial** | UI exists but incomplete, stubbed, or broken |
| **Placeholder** | Empty state only; no real backend |

---

## Global Shell (All Authenticated Pages)

### Desktop Sidebar

- As an admin, I can navigate to Courses, Programs, Classes, Students, Instructors, Transactions, and Approvals
- As an admin, I can open Reconcile (desktop only)
- As an admin, I can download undownloaded invoices as CSV (desktop only)
- As an admin, I can see my logged-in email and sign out
- As an admin, when viewing a class detail with `?from=course\|program\|classes`, the correct nav item stays highlighted

### Mobile

- As an admin, I can use bottom tabs: Courses, Programs, Students, Trainers (Instructors), Transactions, Approvals
- As an admin, I can sign out from the mobile header
- **Gap:** Mobile has no Classes tab, Reconcile, or Download Invoices

### Auth Gate

- As an admin, I must have a Supabase OTP session to access any page except login/OTP
- **Note:** Session check only — not a strict `admins` table gate at the layout level

---

## Authentication

### `/admin/login` — Live

- As an admin, I can enter my email to receive an OTP
- As an admin, I am redirected to `/admin` if already logged in
- As an admin, I can return to midwestea.com from the login screen

### `/admin/otp` — Live

- As an admin, I can enter an 8-digit OTP (with paste support)
- As an admin, I can resend the OTP
- As an admin, I am redirected to `/admin` after successful verification
- As an admin, I am sent back to login if the email query param is missing

### `/admin` — Live

- As an admin, visiting `/admin` redirects me to `/admin/courses`

### `/admin/success` — Partial (legacy)

- As an admin, I can see a post-flow confirmation message
- As an admin, I can log out (redirects to `/login`, not `/admin/login`)

---

## Courses

### `/admin/courses` — Live

- As an admin, I can view all courses in a sortable table (code, name, price, reg fee)
- As an admin, I can click a row to open course detail
- As an admin, I can create a new course via `?mode=add` sidebar (no visible "Add" button on page)

**Create course fields:** name*, code*, length, reg limit, cert length, graduation rate, price, reg fee

### `/admin/courses/[id]` — Live

- As an admin, I can view course metadata (name, code, length, limits, cert length, price)
- As an admin, I can edit course fields in a sidebar (course code is read-only)
- As an admin, I can see scheduled classes for this course and open class detail
- As an admin, I can add a new class for this course via modal
- As an admin, I can see waitlist entries when the course has no classes (name, email, signed-up date)
- As an admin, I can view an activity log of changes to this course

**Edit fields:** name, programming offering, image URL, length, reg limit, cert length, price, Stripe product ID (read-only)

---

## Programs

### `/admin/programs` — Live

- Same user stories as Courses list, scoped to programs

### `/admin/programs/[id]` — Live

- Same user stories as Course detail, scoped to programs (classes, waitlist, edit, add class, activity log)

---

## Classes

### `/admin/classes` — Live

- As an admin, I can view all classes (ID, name, course code, start/end dates, online flag)
- As an admin, I can add a class via "Add Class" button or `?mode=add`
- As an admin, I can open full class detail by clicking a row
- As an admin, I can quick-edit a class via pencil icon (modal)
- As an admin, I can preview a class in a sidebar via `?classId=` (read-only preview + Edit link)

**Class create/edit modal fields:** course/program picker, enrollment open/close, class start/end, online/in-person/hybrid, programming offering, price, reg fee, cert length, reg limit; delete in edit mode

### `/admin/classes/[id]` — Live (primary class detail)

- As an admin, I can view full class details (dates, pricing, limits, online, cert length, etc.)
- As an admin, I can edit or delete a class via modal
- As an admin, I can see enrolled students (name, email)
- As an admin, I can add a student to the class (dropdown of unenrolled students)
- As an admin, I can remove a student from the class (with confirmation)
- As an admin, I can open a student profile from the roster
- As an admin, I can navigate back contextually (to parent course, program, or classes list via `?from=`)
- As an admin, I can view activity logs for this class

### `/admin/classes/add` — Partial (legacy)

- As an admin, I can create a class on a full-screen form
- As an admin, I can pre-fill course/program from query params
- **Gap:** Cancel/back links use wrong paths (missing `/admin` prefix)

### `/admin/class/[id]` — Partial (legacy duplicate)

- As an admin, I can edit class fields on a full-page form
- As an admin, I can delete a class
- As an admin, I can switch to a Students tab (**placeholder only**)

---

## Students

### `/admin/students` — Partial

- As an admin, I can view students (name, email, phone) — **Live**
- As an admin, I can open student detail by clicking a row — **Live**
- As an admin, I can open a sidebar editor via pencil icon — **Partial** (routes to broken `/students?studentId=`, not `/admin/students?...`)
- As an admin, I can save edits from the list sidebar — **Partial** (save is stubbed; does not persist)

### `/admin/students/[id]` — Live (with one gap)

- As an admin, I can view student profile: name, email, phone, t-shirt, emergency contacts, required-info flag, Stripe customer ID
- As an admin, I can edit and save: full name, email, phone, t-shirt, emergency contacts, has-required-info checkbox
- As an admin, I can see enrolled classes with computed payment status (past due, all paid, first payment paid, etc.)
- As an admin, I can see payment history (amount, class, status, paid-at / past-due chip, next due date)
- As an admin, I can view activity logs including enrollment events
- As an admin, I can open enrollment detail sidebar (class info + reg fee / tuition A / B breakdown) — **built but unreachable** (classes table has no row click wired to `handleClassClick`)

### `/admin/students/[id]/classes/[classId]` — Placeholder

- As an admin, I can see placeholder enrollment, attendance, progress, and payment sections
- As an admin, I can click quick actions (Mark Attendance, Send Message, View Class) — **non-functional**
- Student data is hardcoded; only class data is real

---

## Instructors

### `/admin/instructors` — Placeholder

- As an admin, I see "No instructors — table not implemented"
- Sidebar edit UI exists but never loads data
- Row/edit routes go to broken `/instructors/...` paths

### `/admin/instructors/[id]` — Placeholder

- As an admin, I can view fake hardcoded instructor data
- As an admin, I can attempt edit via sidebar — **save is stubbed**
- Classes list is always empty

---

## Transactions & Finance

### `/admin/payments` (labeled "Transactions") — Live

- As an admin, I can view all transactions: invoice #, student name/email, class ID, type, amount, status, due date
- As an admin, I can open transaction detail in a sidebar (row click or `?transactionId=`)
- As an admin, I can mark a pending transaction as paid
- As an admin, I can cancel an invoice (browser confirm); hidden when paid/cancelled
- As an admin, I can navigate to the student profile from transaction detail

**Transaction types shown:** Registration Fee, First Invoice (tuition A), Second Invoice (tuition B)

### `/admin/reconcile` — Live (desktop nav only)

- As an admin, I can view transactions grouped by Stripe payout batch (total paid out + payout date)
- As an admin, I can mark individual transactions as reconciled
- As an admin, I can undo reconciliation (hover "Reconciled" badge → Undo)

### Sidebar: Download Invoices — Live (desktop only)

- As an admin, I can export undownloaded transactions as CSV
- As an admin, I see an alert if there are no new invoices

---

## Approvals

### `/admin/approvals` — Placeholder

- As an admin, I see "No pending approvals" empty state only
- No list, approve/reject, or backend integration

---

## Cross-Cutting Patterns to Preserve in the New Design

These appear across multiple pages — if the new design drops them, you lose parity.

| Pattern | Where Used |
|---------|------------|
| **Sortable `DataTable`** with row click | All list pages |
| **`DetailSidebar`** for create/edit/detail | Courses, programs, students, transactions, class preview |
| **`CreateClassModal`** for class CRUD | Classes list, class detail, course/program detail |
| **`LogDisplay` activity log** | Course, program, class, student detail |
| **Deep-link query params** | `?mode=add`, `?edit=true`, `?transactionId=`, `?studentId=`, `?classId=`, `?from=course\|program\|classes` |
| **Field-change audit logging** | Course/program/student saves → `/api/logs/detail-update` |
| **Enrollment audit logging** | Add/remove student on class → `/api/logs/student-enrollment` |

---

## Backend Exists, No Admin UI Yet

If the new design includes these, they are **net-new** work (APIs exist, no page):

- Email delivery logs (`/api/admin/email-logs`)
- Email log retry (`/api/admin/email-logs/[logId]/retry`)
- Email metrics (`/api/admin/email-metrics`)

---

## Parity Checklist Summary

| Area | Match New Design? |
|------|-------------------|
| OTP login | Full parity expected |
| Courses / Programs CRUD + detail + waitlist + logs | Full parity expected |
| Classes CRUD + roster + enroll/unenroll + logs | Full parity expected |
| Student detail (profile, payments, classes, edit, logs) | Include enrollment sidebar click |
| Transactions (view, mark paid, cancel) | Full parity expected |
| Reconcile + CSV export | Full parity expected |
| Mobile nav | Design must cover Classes, Reconcile, CSV or accept gaps |
| Instructors | Placeholder only — decide build vs drop |
| Approvals | Placeholder only — decide build vs drop |
| Student-class detail route | Placeholder only — decide build vs drop |
| List-page student quick edit | Broken/stubbed today |

---

## Known Gaps (Not in Current UI at All)

- No search, filters, pagination, or bulk actions on any list page
- No dedicated "Add course/program" buttons (only URL param `?mode=add`)
- No admin role management UI

---

## Route Map

```
/admin                          → redirect to /admin/courses
/admin/login                    → OTP email entry
/admin/otp                      → 8-digit OTP verification
/admin/success                  → post-flow confirmation (legacy)
/admin/courses                  → course list
/admin/courses/[id]             → course detail
/admin/programs                 → program list
/admin/programs/[id]            → program detail
/admin/classes                  → class list
/admin/classes/[id]             → class detail (primary)
/admin/classes/add              → add class (legacy full-screen)
/admin/class/[id]               → class detail (legacy full-screen)
/admin/students                 → student list
/admin/students/[id]            → student detail
/admin/students/[id]/classes/[classId] → enrollment stub
/admin/instructors              → instructor list (stub)
/admin/instructors/[id]         → instructor detail (stub)
/admin/payments                 → transactions list
/admin/approvals                → placeholder
/admin/reconcile                → payout reconciliation
```

---

## API Routes Used by Admin UI

| Route | Method | Used By | Auth |
|-------|--------|---------|------|
| `/api/admin/transactions` | GET | Payments, Reconcile, student enrollments | Admin Bearer + `admins` table |
| `/api/classes/create` | POST | Class creation | Session (via lib) |
| `/api/classes/[id]/update` | POST | Class update | Session |
| `/api/classes/[id]/delete` | POST | Class delete | Session |
| `/api/waitlist/by-course-code/[courseCode]` | GET | Course/Program detail | Unknown |
| `/api/logs/detail-update` | POST | Course/Student edit saves | Admin Bearer |
| `/api/logs/student-enrollment` | POST | Add/remove student from class | Admin Bearer |
| `/api/students/[id]/email` | GET | Student detail email fetch | Admin Bearer |
| `/api/students/[id]/update-email` | POST | Student email update | Admin Bearer |
| `/api/transactions/reconcile` | POST | Reconcile page | Session token in lib |
| `/api/transactions/unreconcile` | POST | Reconcile page | Session token in lib |
| `/api/export-transactions-csv` | GET | Sidebar download | **None** |

**Admin APIs with no UI yet:** `/api/admin/email-logs`, `/api/admin/email-logs/[logId]/retry`, `/api/admin/email-metrics`

---

## Implementation Maturity Summary

| Area | Status |
|------|--------|
| Auth (OTP) | Functional |
| Courses / Programs / Classes | Fully functional (dual legacy routes exist) |
| Students | List + detail functional; list-page save stubbed |
| Transactions / Reconcile | Functional |
| Instructors | Stub |
| Approvals | Stub |
| Student-class enrollment page | Stub |
| Email admin monitoring | API only, no dashboard page |
| Mobile nav | Missing Classes, Reconcile, CSV export |
| Role enforcement | Strong on some APIs; weak at layout level |

---

## Notable Issues (for Follow-Up)

1. **Broken routes:** Instructors list/detail and students list edit use `/instructors/` and `/students/` instead of `/admin/...`.
2. **Legacy duplicate UIs:** `/admin/class/[id]` and `/admin/classes/[id]`; `/admin/classes/add` vs modal-based create.
3. **Unauthenticated CSV export:** `/api/export-transactions-csv` should require admin auth.
4. **Student detail:** Enrollment sidebar built but classes table missing `onRowClick`.
5. **Login gate vs admin gate:** Any OTP-authenticated user can reach the dashboard; `admins` table only enforced on select API routes.
6. **No filters/search/export** on list pages except transaction deep-linking and CSV sidebar action.
