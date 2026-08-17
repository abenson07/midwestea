# Migration guide

## Class detail — header (`ClassInfoBox.tsx`)

- **PARA-001** is the class name shown at the top. It's the class ID (was previously showing the internal demo title "Open Class A" instead).
- **Paramedic Program** (with a graduation-cap icon) sits right under the title. It's the Program/Course template this class was created from, and it links to that template's page.
- **32 days left to register**, next to it, is a countdown to registration close (static placeholder text for now, not computed from a real date).
- All three come from `classMocks.ts` (`classCode` and `template` on `ClassDetail`), so `open-class-a` and `open-class-b` both currently show `PARA-001` / Paramedic Program as placeholder values.
- The template link goes to `/admin-preview/programs/paramedic-program`, which is currently a placeholder page (same "nothing here yet" pattern used by other not-yet-built pages in this app, e.g. `/bls`, `/acls`).

## Class detail — Prerequisites & Invoices

- These used to be two full tables stacked on the page. They're now two banners side by side: **"X Prerequisites to review"** and **"X Invoices past due"**, each just showing a count.
- Clicking a banner opens a modal with the same table that used to sit inline on the page (same columns, same approve/reject/remind actions — nothing about the table itself changed, it just moved into a modal).
