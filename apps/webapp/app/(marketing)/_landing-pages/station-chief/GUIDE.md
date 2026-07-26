# Station Chief landing page template

Reusable template for a "station chief" persona landing page (11 sections:
Header 82 → Layout 1 → Layout 1 → Layout 1 → Layout 141 → Layout 241 →
Content 12 → Testimonial 19 → CTA 25 → FAQ banner → Header 108).

Note: the Figma design also had an unnamed "Frame 2147223606" section between
Header 82 and the first Layout 1 — this is the scrolled visual state of
Header 82's own scroll animation, not a separate section, and is intentionally
not implemented as a component.

## Files
- `components/` — copied, standalone section components (do not import
  these from elsewhere; copy again into another page's own `components/`
  folder if reused).
- `content.ts` — the `StationChiefContent` type and `stationChiefContent`,
  the filled-in copy for this instance.
- `template.tsx` — the reusable layout skeleton. Only edit to change section
  choice/order, not content.
- `page.tsx` — wires `template.tsx` + `stationChiefContent` together. Not a
  live route (see below).

## To duplicate this for a new audience/story
1. Copy this whole folder to a new slug under
   `apps/webapp/app/(marketing)/_landing-pages/<new-slug>/`.
2. In the copy's `content.ts`, rename `stationChiefContent` and rewrite every
   field for the new audience. Keep the type import as-is unless a section
   is added/removed.
3. Update the copy's `page.tsx` to import the renamed content export.
4. Leave `template.tsx` and `components/` untouched unless the layout itself
   is changing.

## Going live
Not routed (private `_landing-pages` folder). When an instance is ready for
an actual campaign, move/copy its `page.tsx` (plus the `template.tsx` +
`components/` it depends on) into a real routed location and wire it up
there.
