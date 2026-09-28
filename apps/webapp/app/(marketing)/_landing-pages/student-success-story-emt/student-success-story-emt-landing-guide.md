# Student Success Story landing page — content guide

**Page goal**: tell the story of one real (or representative) student who
enrolled, graduated, and is now succeeding in an EMS career — so a
prospective student in a similar spot sees themselves in it and believes
the same path is open to them. Every section exists to move the reader
along that arc: relatable starting point → why they enrolled here → what
training was actually like → proof it worked → "you could be next."

The current instance is filled in for **Greg** (career-changer, warehouse
worker → paramedic). When duplicating this template for a new
student/story, keep this same arc — only the specific person, their
"before," and their outcome should change.

## Section-by-section

1. **`header137` — Hero / "This could be you"**
   The first thing the reader sees. Names the transformation in one line
   (before → after) so the reader immediately knows whose story this is and
   what changed for them. Keep it concrete and specific to the person, not
   generic ("Greg went from warehouse shifts to the back of an ambulance"),
   not a vague slogan ("Change your career today").

2. **`layout1A` — Where they started**
   Establishes the "before": what the student's life/job looked like before
   enrolling, and why it wasn't working for them. This is what makes the
   reader think "that's me." Write it in specific, relatable terms (a
   schedule, a frustration, a stuck feeling) — not generalities.

3. **`comparison6` — Before vs. after, side by side**
   A direct, scannable contrast between the student's old situation and
   their new one. This is the section that makes the transformation feel
   real and measurable — use it to list concrete gains (certification,
   income, stability), not just adjectives.

4. **`layout1B` — Why they chose this program**
   Answers the reader's next question: "okay, but why THIS program and not
   somewhere else, or not at all?" This is where practical
   enrollment-deciding factors go — scheduling, cost, how it fit their life
   at the time they enrolled.

5. **`layout1C` — What training was actually like**
   Removes uncertainty about the experience itself. A prospective student
   is often intimidated by not knowing what the program actually involves
   day to day — this section should describe real, hands-on specifics, not
   marketing abstractions.

6. **`layout241` — The outcome**
   The proof: what the student achieved, laid out as a short list of
   concrete results (certified, employed, advancing). This is the payoff of
   the arc — it should read like a scorecard, not more narrative.

7. **`content2` — In their own words**
   A first-person quote/reflection from the student themselves, in a more
   personal, unpolished voice than the rest of the page. This is where
   authenticity lives — write it like something a real person would
   actually say, not ad copy.

8. **`testimonial19` — Reinforcing testimonial**
   A second, shorter quote reinforcing the same story in testimonial/review
   form (with name, role, company). Functions as social proof alongside the
   more narrative `content2` section above it.

9. **`faqBanner` — Objection handling**
   Answers the practical questions a prospective student in this same
   position would still have before enrolling (schedule, cost, timeline,
   job placement). Write these from that reader's specific hesitations, not
   as a generic FAQ list.

10. **`header108` — Closing call to action**
    The final push: "you could have this outcome too." Should echo the
    hero's transformation language and end on a direct, single CTA.

## To duplicate this for a new student/story
1. Copy this whole folder to a new slug under
   `apps/webapp/app/(marketing)/_landing-pages/<new-slug>/`.
2. In the copy's `content.ts`, rename `gregStoryContent` to something
   specific to the new story, and rewrite every field following the
   section-by-section guidance above — new "before," new program-choice
   reasons, new training specifics, new outcome, new quotes. Keep the
   `StudentSuccessStoryContent` type import as-is unless a section is being
   added/removed.
3. Update the copy's `page.tsx` to import the renamed content export.
4. Leave `template.tsx` and `components/` untouched unless the section
   choice/order itself is changing for this new story.

## Files
- `components/` — copied, standalone section components (do not import
  these from anywhere else; if another page needs the same section, copy
  it again into that page's own `components/` folder).
- `content.ts` — the `StudentSuccessStoryContent` type (one field per
  section) and `gregStoryContent`, the filled-in copy for Greg's story.
- `template.tsx` — the reusable layout skeleton. Do not edit this to change
  content — only edit it if the section order/composition itself changes.
- `page.tsx` — concrete page wiring `template.tsx` + `gregStoryContent`
  together. Not a live route (see below).

## Going live
This page is intentionally not routed (lives under the `_landing-pages`
private folder, which Next.js excludes from routing entirely). When a
specific instance is ready for an actual campaign, move/copy its `page.tsx`
(and the `template.tsx` + `components/` it depends on) into a real routed
location and wire it up there — do not remove the underscore prefix on this
shared template location itself.
