# Migration guide

## Class detail — header (`ClassInfoBox.tsx`)

- **PARA-001** is the class name shown at the top. It's the class ID (was previously showing the internal demo title "Open Class A" instead).
- **Paramedic Program** (with a graduation-cap icon) sits right under the title. It's the Program/Course template this class was created from, and it links to that template's page.
- **32 days left to register**, next to it, is a countdown to registration close (static placeholder text for now, not computed from a real date).
- All three come from `classMocks.ts` (`classCode` and `template` on `ClassDetail`), so `open-class-a` and `open-class-b` both currently show `PARA-001` / Paramedic Program as placeholder values.
- The template link goes to `/admin-preview/programs/paramedic-program`, which is currently a placeholder page (same "nothing here yet" pattern used by other not-yet-built pages in this app, e.g. `/bls`, `/acls`).

## Class detail — Prerequisites & Invoices

- These used to be two full tables stacked on the page. They're now two banners side by side: **"X Prerequisites to review"** and **"X Invoices past due"**, each just showing a count.
- Clicking a banner opens a modal with the content that used to sit inline on the page.

## Class detail — Prerequisites modal (banner click)

- The modal is now near-fullscreen (64px margin on every side, via a new `fullScreenInset` option on the shared `Modal`) instead of a fixed small width.
- The modal body is a 12-column grid: an 8-column document viewer on the left, a 4-column list of submissions on the right. Click a row in the list to view it.
- The viewer shows the actual submitted document — a PDF (`public/documents/spencer-nash-certificate.pdf`, standing in for whatever the student actually uploaded) — embedded with the browser's PDF toolbar hidden (`#toolbar=0&navpanes=0` on the src) but still scrollable if it's more than one page.
- **Approve** / **Reject** live in the viewer for whichever submission is selected. Deciding one auto-advances the viewer to the next still-pending row.
- A decided row stays in the list (with a check/x marker) so you can click back onto it — the viewer then shows **Approved**/**Rejected** with an **Undo** button instead of Approve/Reject.
- Decisions are only committed when the modal closes: the banner's count, and the list you see next time you open it, only reflect submissions still awaiting review. While the modal is open, decided-but-not-yet-closed rows are still visible (that's the undo window).
- **See all**, bottom right, closes the modal and goes to a dedicated Prerequisites page for the class.

## Class detail — Prerequisites page (`/open-class-a/prerequisites`, `/open-class-b/prerequisites`)

- Same pattern as Settings and the Invoices page: its own route, "Back to Class" up top.
- 12-column grid, same shift-on-select behavior as the Invoices page: full width until a row is selected, then an 11-column table plus a 1-column (280px floor) sidebar with the same certificate viewer used in the modal.

## Class detail — Invoices page (`/open-class-a/payments`, `/open-class-b/payments`)

- The Invoices modal has a **"View all invoices"** button that takes you to a dedicated Invoices page for the class, same pattern as "Edit" taking you to Settings (own route, "Back to Class" up top).
- Clicking a row in the modal instead of the button takes you to that same page with that row already selected (`?invoiceId=...` in the URL).
- On the Invoices page itself, the table is a 12-column grid. With nothing selected it uses all 12. Click a row and it shifts to an 11-column table plus a sidebar with that invoice's info (student, amount, due date, Remind). Note: the sidebar column has a 280px floor so the numbers/text stay readable — a literal 1/12 slice was too narrow to hold anything.
- The selected row gets a full-row active-state background (same token the table already used for hover), so it's clear which invoice the sidebar is showing. Added as an `isRowSelected` option on the shared `GroupedTable`, so any other table can opt into the same treatment.
- The left column is two stacked sections, 48px apart. **"Past due invoices"** is wrapped in card chrome (bordered panel) — columns are Student, Invoice #, Type, Amount, **Past Due** (days-overdue text, e.g. "5 days past due", not the raw due date — red like the Status column), Remind. It's the actionable, needs-collection list. **"All invoices"** below it, not in a card, is a real ledger table instead: Student, Invoice #, Type, Amount, Due Date, Status (plain colored text — green Paid, amber Pending, red Past due), no Remind column, matching the transactions-style table it's meant to represent. It has its own search box + Status/Type filter dropdown (same `ListToolbar` used elsewhere in the app). Rows in either table select into the sidebar.
- "All invoices" is inset left/right by `calc(20px + border-width)` so its columns line up with the card's inner content above it, even though it isn't in a card itself.
- The Overview page's "X Invoices past due" banner now navigates straight to this page instead of opening a modal — the modal's gone.
- `open-class-b`'s two unpaid invoices are `status: "Pending"` (not `"Past due"`), so both the zero state on Overview and the empty "Past due invoices" card here are reachable in the demo.
- The Overview banner's zero state reads **"Payments on track"** instead of "0 Invoices past due" — less negative-sounding. Nonzero still reads "X Invoices past due".
- On the Invoices page, the "Past due invoices" card doesn't render at all when there's nothing past due (`open-class-b`) — no empty card, straight to "All invoices".
- Both tables read from one master list per class (`CLASS_INVOICES` in `classMocks.ts`) — "Past due invoices" is just `.filter(status === "Past due")` on it, not a separately maintained array. So a row that appears in both tables is the same record with the same id, and selecting it highlights it in both.

## Class detail — Class Details card (Settings only — overview reverted)

The overview rail's card (`ClassDetailsCard.tsx`) was reverted back to its original 6 rows — Status, Registration, Tuition, Class size, Type, Dates — sourced from the current field names (`price` for Tuition, `registrationLimit` for Class size, `classStart`–`classEnd` formatted as a range for Dates, via `formatCalendarDate`). Only the "Class details" section of Settings (`ClassSettingsPage.tsx`) shows the full 14-field list, in this order:

- **Class name**, **Class ID**, **Course code** — locked/read-only in Settings (a class's ID and template are set at creation and don't change).
- **Online** — Yes/No, derived from Class Type (Online → Yes, Hybrid/In-person → No), not its own editable field.
- **Location**
- **Enrollment start** / **Enrollment close**
- **Class start** / **Class end**
- **Length of class**
- **Registration limit**
- **Certification length**
- **Price**
- **Registration fee**

This replaces what was there before: Status, Registration, Tuition, Class size, Type, and a single free-text Dates range.

Enrollment/class dates are stored as plain `YYYY-MM-DD` strings on `ClassDetail` and rendered with the new `formatCalendarDate()` helper in [`src/lib/dates.ts`](src/lib/dates.ts) — it parses the Y/M/D parts and builds a local `Date` instead of doing `new Date("2026-01-12")`, which Chrome parses as UTC midnight and can roll back a day once formatted in a timezone behind UTC. The Settings inputs are native `<input type="date">` bound directly to the same `YYYY-MM-DD` string, so there's no Date-object round-trip on the editing side either. `src/lib/dates.ts` also has `formatChicagoTimestamp()` for the timestamp case (America/Chicago display), ready for wherever a real timestamp field shows up next — nothing on this card needed it since all of these are calendar dates, not timestamps.
