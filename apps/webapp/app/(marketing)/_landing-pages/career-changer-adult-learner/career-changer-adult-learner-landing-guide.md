# Career Changer / Adult Learner landing page — content guide

**Page goal**: reach an adult who is considering leaving their current path
for EMS — whether they're already adjacent to medicine (e.g. a hospital
tech, CNA) or coming from an unrelated field entirely — and get them to
believe this is a realistic, achievable move for them specifically. The
core job of this page is **explaining what it's actually like to be in
this role** (day-to-day, training, the different tracks) and clearing the
practical doubts (age, time, cost, "do I need experience?") that keep
adults from starting.

Note: `Header / 108 /` and `Layout / 1 /` each repeat within this page, so
each occurrence has its own file/component (`header-108.tsx`/`Header108`,
`header-108-b.tsx`/`Header108B`, `header-108-c.tsx`/`Header108C`;
`layout-1.tsx`/`Layout1`, `layout-1-b.tsx`/`Layout1B`) even though they're
visually identical components — this keeps each instance independently
editable, which matters here since they carry very different content beats
(see below).

## Section-by-section

1. **`header108A` — Hero / "It's not too late"**
   The reassurance hook. Directly names and defuses the biggest fear a
   career changer has (too old, too late, too much to lose) before anything
   else is said.

2. **`header108B` — "No medical background required"**
   Removes the specific barrier that stops people from even considering
   EMS: the assumption you need prior medical experience. This should read
   as a direct, standalone reassurance, distinct from the hero above it.

3. **`layout1A` — Fits your current life**
   Addresses the logistics of actually doing this as an adult with existing
   obligations — a job, a family, a schedule already spoken for.

4. **`layout48` — Direct objection handling**
   The three biggest hesitations, named and answered head-on ("I'm too old
   to start over," "I don't have time," "I can't afford it"). Unlike the
   other sections, this one should state the reader's actual internal
   objection verbatim, then answer it — not soften it into a generic
   heading.

5. **`layout241` — The path, step by step**
   Removes uncertainty about the process itself by laying out a simple
   three-step structure (enroll → train → get hired). This exists to make
   the decision feel concrete and finite, not open-ended.

6. **`layout1B` — What training is actually like**
   Describes the hands-on training experience itself — this is where
   "what is this role actually like" starts to become tangible, ahead of
   the role-comparison section below.

7. **`comparison6` — What it's like to be an EMT vs. a paramedic**
   The core "explain the role" section. This should help the reader
   understand the real difference between tracks — scope of work, day-to-
   day responsibilities, training length — so they can picture themselves
   in one of these roles specifically, not just "a career in EMS" in the
   abstract.

8. **`content12` — Support built for career changers specifically**
   Reassures the reader they won't be figuring this out alone — describes
   advisor support aimed at people making this exact kind of life change
   (as opposed to a traditional student straight out of school).

9. **`testimonial19` — Proof from someone who made this exact change**
   A quote from a real-sounding adult learner who made this same jump.
   Should explicitly reference the age/time/background hesitation being
   overcome, echoing the objections handled in `layout48`.

10. **`cta25` — Mid-page conversion moment**
    A direct ask (e.g. request program info) placed right after the
    strongest trust-building content, before the reader reaches the FAQ.

11. **`faqBanner` — Remaining practical questions**
    Covers the logistics questions specific to adult learners (background
    needed, scheduling around work, financial aid, time to certification) —
    distinct from a general FAQ, these should be framed for someone
    currently employed elsewhere.

12. **`header108C` — Closing call to action**
    Final push framed as the adult learner's next chapter — echoes the
    hero's "it's not too late" framing to close the loop.

## To duplicate this for a new audience/story
1. Copy this whole folder to a new slug under
   `apps/webapp/app/(marketing)/_landing-pages/<new-slug>/`.
2. In the copy's `content.ts`, rename `careerChangerContent` and rewrite
   every field following the section-by-section guidance above. If the new
   audience is already medically adjacent (e.g. a CNA or medical assistant
   moving into EMS) rather than starting from zero, adjust `header108B`,
   `layout48`, and `comparison6` accordingly — the "no experience needed"
   framing may need to become "here's what transfers from what you already
   know" instead. Keep the type import as-is unless a section is
   added/removed.
3. Update the copy's `page.tsx` to import the renamed content export.
4. Leave `template.tsx` and `components/` untouched unless the layout
   itself is changing.

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

## Going live
Not routed (private `_landing-pages` folder). When an instance is ready
for an actual campaign, move/copy its `page.tsx` (plus `template.tsx` +
`components/`) into a real routed location and wire it up there.
