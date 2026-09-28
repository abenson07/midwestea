# Station Chief landing page — content guide

**Page goal**: convince a department leader (station chief, training
officer, shift supervisor — someone responsible for their whole crew, not
just themselves) to enroll their **team** in paramedic/EMT training. The
reader isn't asking "should I do this for me?" — they're asking "should I
commit my department's people, schedule, and budget to this?" Every
section should speak to that organizational decision, not an individual
career decision.

Note: the Figma design also had an unnamed "Frame 2147223606" section
between Header 82 and the first Layout 1 — this is the scrolled visual
state of Header 82's own scroll animation, not a separate content section,
and is intentionally not implemented as a component.

## Section-by-section

1. **`header82` — Hero / "Give your crew a path"**
   Frames the offer at the department level from the first line — this is
   about the whole team's certification and advancement, not one person's
   career change. Should immediately signal "this is for leaders," not
   "this is for you personally."

2. **`layout1A` — Scheduling fits how your crew actually works**
   The first objection a station chief will have: "my people work 24/48s
   (or similar rotations) — how does training even fit?" This section
   exists purely to remove that logistical blocker before anything else.

3. **`layout1B` — Accreditation the leader can vouch for**
   A department leader is putting their own credibility on the line
   recommending this program to command staff or their crew. This section
   gives them the accreditation/standards proof they need to make that case
   confidently.

4. **`layout1C` — The career ladder this creates for their team**
   Reframes the value from "training" to "retention and advancement tool" —
   a clear path from EMT to paramedic is something a leader can use to keep
   good people and reward them, without losing them to another department.

5. **`layout141` — How a department partnership actually works**
   Addresses the practical "how do we actually do this" question — group
   enrollment, tuition assistance conversations, a point of contact. This
   is where the reader starts picturing the logistics of committing their
   team.

6. **`layout241` — What departments get (the ROI summary)**
   A scannable outcome summary aimed at a decision-maker: accredited,
   flexible, supported. This is the department-level equivalent of the
   student page's "outcome" section — proof the investment pays off.

7. **`content12` — What the ongoing partnership looks like**
   Goes one level deeper than `layout141` — describes what working with the
   academy looks like on an ongoing basis (scheduling cohorts, tracking
   progress across the whole crew), reassuring the leader this isn't a
   one-time transaction.

8. **`testimonial19` — Proof from a peer leader**
   A quote from someone in a similar leadership role (training officer,
   station chief), not from an individual student. Peer credibility matters
   more here than an individual success story would.

9. **`cta25` — Mid-page conversion moment**
   A dedicated, direct ask aimed at department leads specifically (e.g.
   "talk to admissions about group enrollment") — this is the
   organizational-commitment CTA, distinct from an individual "enroll now."

10. **`faqBanner` — Objection handling for decision-makers**
    Answers the questions a leader (not an individual student) would still
    have before committing their department — scheduling around shifts,
    funding/tuition assistance, accreditation, timeline. Write these from
    the leader's planning perspective, not a personal one.

11. **`header108` — Closing call to action**
    Restates the department-level offer and ends on a single, clear next
    step for a leader ready to act on behalf of their team.

## To duplicate this for a new audience/story
1. Copy this whole folder to a new slug under
   `apps/webapp/app/(marketing)/_landing-pages/<new-slug>/`.
2. In the copy's `content.ts`, rename `stationChiefContent` and rewrite
   every field following the section-by-section guidance above, keeping the
   department-decision-maker framing throughout — even if the specific
   audience changes (e.g. a hospital EMS director instead of a fire station
   chief), the "convince the leader to commit their team" arc should stay
   intact. Keep the type import as-is unless a section is added/removed.
3. Update the copy's `page.tsx` to import the renamed content export.
4. Leave `template.tsx` and `components/` untouched unless the layout
   itself is changing.

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

## Going live
Not routed (private `_landing-pages` folder). When an instance is ready for
an actual campaign, move/copy its `page.tsx` (plus the `template.tsx` +
`components/` it depends on) into a real routed location and wire it up
there.
