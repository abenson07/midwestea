# Career Changer / Adult Learner landing page template

Reusable template for an adult-learner/career-changer persona landing page
(12 sections: Header 108 → Header 108(b) → Layout 1 → Layout 48 →
Layout 241 → Layout 1(b) → Comparison 6 → Content 12 → Testimonial 19 →
CTA 25 → FAQ banner → Header 108(c)).

Note: `Header / 108 /` and `Layout / 1 /` each repeat within this page, so
each occurrence has its own file/component (`header-108.tsx`/`Header108`,
`header-108-b.tsx`/`Header108B`, `header-108-c.tsx`/`Header108C`;
`layout-1.tsx`/`Layout1`, `layout-1-b.tsx`/`Layout1B`) even though they're
visually identical components — this keeps each instance independently
editable.

## Files
- `components/` — copied, standalone section components (do not import
  these from elsewhere; copy again into another page's own `components/`
  folder if reused).
- `content.ts` — the `CareerChangerAdultLearnerContent` type and
  `careerChangerContent`, the filled-in copy for this instance.
- `template.tsx` — the reusable layout skeleton. Only edit to change
  section choice/order, not content.
- `page.tsx` — wires `template.tsx` + `careerChangerContent` together. Not
  a live route (see below).

## To duplicate this for a new audience/story
1. Copy this whole folder to a new slug under
   `apps/webapp/app/(marketing)/_landing-pages/<new-slug>/`.
2. In the copy's `content.ts`, rename `careerChangerContent` and rewrite
   every field for the new audience. Keep the type import as-is unless a
   section is added/removed.
3. Update the copy's `page.tsx` to import the renamed content export.
4. Leave `template.tsx` and `components/` untouched unless the layout
   itself is changing.

## Going live
Not routed (private `_landing-pages` folder). When an instance is ready
for an actual campaign, move/copy its `page.tsx` (plus `template.tsx` +
`components/`) into a real routed location and wire it up there.
