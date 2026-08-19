# Continuing Education landing page template

Reusable template for a continuing-education persona landing page (11
sections: Header 137 → Layout 1 → Layout 48 → Layout 1 → Layout 1 →
Layout 1 → Content 2 → Testimonial 19 → CTA 25 → FAQ banner → Header 108).

## Files
- `components/` — copied, standalone section components (do not import
  these from elsewhere; copy again into another page's own `components/`
  folder if reused).
- `content.ts` — the `ContinuingEducationContent` type and
  `continuingEducationContent`, the filled-in copy for this instance.
- `template.tsx` — the reusable layout skeleton. Only edit to change
  section choice/order, not content.
- `page.tsx` — wires `template.tsx` + `continuingEducationContent`
  together. Not a live route (see below).

## To duplicate this for a new audience/story
1. Copy this whole folder to a new slug under
   `apps/webapp/app/(marketing)/_landing-pages/<new-slug>/`.
2. In the copy's `content.ts`, rename `continuingEducationContent` and
   rewrite every field for the new audience. Keep the type import as-is
   unless a section is added/removed.
3. Update the copy's `page.tsx` to import the renamed content export.
4. Leave `template.tsx` and `components/` untouched unless the layout
   itself is changing.

## Going live
Not routed (private `_landing-pages` folder). When an instance is ready
for an actual campaign, move/copy its `page.tsx` (plus `template.tsx` +
`components/`) into a real routed location and wire it up there.
