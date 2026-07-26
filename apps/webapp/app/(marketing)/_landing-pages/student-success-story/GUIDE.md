# Student Success Story landing page template

Reusable template for a single-student "success story" landing page
(10 sections: Header 137 → Layout 1 → Comparison 6 → Layout 1 → Layout 1 →
Layout 241 → Content 2 → Testimonial 19 → FAQ banner → Header 108).

## Files
- `components/` — copied, standalone section components (do not import these
  from anywhere else; if another page needs the same section, copy it again
  into that page's own `components/` folder).
- `content.ts` — the `StudentSuccessStoryContent` type (one field per
  section) and `gregStoryContent`, the filled-in copy for Greg's story.
- `template.tsx` — the reusable layout skeleton. Do not edit this to change
  content — only edit it if the section order/composition itself changes.
- `page.tsx` — concrete page wiring `template.tsx` + `gregStoryContent`
  together. Not a live route (see below).

## To duplicate this for a new student/story
1. Copy this whole folder to a new slug under
   `apps/webapp/app/(marketing)/_landing-pages/<new-slug>/`.
2. In the copy's `content.ts`, rename `gregStoryContent` to something
   specific to the new story, and rewrite every field's copy for the new
   student/audience. Keep the `StudentSuccessStoryContent` type import as-is
   unless a section is being added/removed.
3. Update the copy's `page.tsx` to import the renamed content export.
4. Leave `template.tsx` and `components/` untouched unless the layout itself
   (section choice/order) is changing for this new story.

## Going live
This page is intentionally not routed (lives under the `_landing-pages`
private folder, which Next.js excludes from routing entirely). When a
specific instance is ready for an actual campaign, move/copy its `page.tsx`
(and the `template.tsx` + `components/` it depends on) into a real routed
location and wire it up there — do not remove the underscore prefix on this
shared template location itself.
