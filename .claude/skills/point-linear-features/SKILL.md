---
name: point-linear-features
description: Prices feature Issues in Linear using a six-axis Fibonacci scoring framework, then writes the resulting estimate (and reasoning) back to each Issue via the Linear MCP API. Use when asked to "point", "size", "estimate", or "price" Linear features/issues, or when the user invokes /point-linear-features.
metadata:
  author: midwestea
  version: "0.1.0"
---

# Point Linear Features

Prices Linear Issues that represent product features: assigns a Fibonacci point value (1–21), a
defensible price band, and a short written case — then writes the result back to Linear as the
Issue's estimate plus a comment recording the reasoning.

This skill treats **pricing as judgment**, not a formula. The six axes below are a calibration
check on a point value you're already leaning toward, not inputs to average or sum. Never
reconstruct an Issue's price by summing sub-issue/story estimates.

## Step 0: Load the Linear tools and scope the run

Load the Linear MCP tool schemas once, in a single call, before doing anything else:

```
ToolSearch: "select:mcp__00d80188-dbf8-4109-8e33-4d950baa7add__list_issues,mcp__00d80188-dbf8-4109-8e33-4d950baa7add__get_issue,mcp__00d80188-dbf8-4109-8e33-4d950baa7add__save_issue,mcp__00d80188-dbf8-4109-8e33-4d950baa7add__save_comment,mcp__00d80188-dbf8-4109-8e33-4d950baa7add__list_issue_labels,mcp__00d80188-dbf8-4109-8e33-4d950baa7add__list_issue_statuses,mcp__00d80188-dbf8-4109-8e33-4d950baa7add__list_teams,mcp__00d80188-dbf8-4109-8e33-4d950baa7add__list_projects,mcp__00d80188-dbf8-4109-8e33-4d950baa7add__get_project"
```

Then determine scope from the invocation arguments (a team, project, label, or a specific Issue
ID/URL). If no scope was given and it isn't obvious from conversation context, ask the user rather
than guessing which team/project/label to sweep — this writes to a shared system, so don't assume.

"Feature" issues are the ones in scope. Prefer filtering by Linear's Issue **type** field if the
workspace uses one; fall back to a `Feature` label if not. If neither is queryable, ask the user
how features are distinguished in their workspace, or accept an explicit list of Issue IDs from
them instead of sweeping.

Only consider **top-level Issues** (L1s). If `list_issues`/`get_issue` surfaces items that are
themselves sub-issues (an L2 with a parent), skip them — they are implementation grain, not
pricing grain (see below). If an Issue already has a non-empty estimate, surface it in the report
but ask before overwriting rather than silently repricing it.

## Step 1: Is this one Issue or several?

Before scoring, check whether the item in front of you is genuinely one Issue, or several Issues
that got grouped under one label.

**Test:** if splitting it into parts changes nothing about what each part means on its own, they
are separate Issues — score and price each independently. If the parts only make sense in light of
each other — they share one outcome, one spec, one definition of "done" — it's a single Issue with
internal stories. Score it once, as a whole, using the six axes. Do not sum the internal
story/sub-issue estimates.

Flag any Issue where this is ambiguous, and explain which way you leaned and why. Watch for: a
single interconnected workflow (e.g. a multi-step review/approval process) that's been split into
several story-like sub-issues with individual estimates. If the pieces clearly depend on and
constrain each other's design, recommend collapsing into fewer, larger Issues in Linear rather than
pricing each fragment separately — don't silently reprice the fragments as if the split were
correct.

## Step 2: Score the Issue on six axes

Read the Issue's full description and its sub-issues (via `get_issue`) before scoring. For each
Issue, assess where it falls (1–5) on each axis. These are a calibration/gut-check layer, not a
separate pricing output.

1. **Implementability vs. assessment-needed** — obvious spec, one clear path (low), or real
   thinking required before it can be built (high)?
2. **Breadth** — self-contained (low), or touches multiple systems, screens, or data models (high)?
3. **Complexity** — known, previously-built pattern (low), or unfamiliar territory — new API,
   new library, first-time integration (high)?
4. **Likelihood of going wrong** — testable with one correct outcome (low), or subjective/ambiguous
   with multiple plausible outcomes (high)? *(weighted)*
5. **Severity if wrong** — cheap and fast to fix (low), or expensive to unwind, cascading into
   other features, or damaging to trust (high)? *(weighted)*
6. **Interconnectedness** — isolated decision (low), or constrains/reshapes other decisions, e.g.
   a data model other features depend on (high)?

**Weighting rule:** axes 4 and 5 matter more than the other four. If both are scoring 4–5
together, that pairing is the single strongest signal the Issue needs a wider price band or a
higher point value than its other axes alone would suggest. Call this out explicitly when it
applies — never quietly wave this pattern through at a low point value.

## Step 3: Assign the point value

- **1 — Trivial** — spec obvious, one clear way to do it, touches nothing else.
- **2 — Small** — straightforward, maybe one small judgment call, still self-contained.
- **3 — Modest** — known pattern, a bit of assessment needed, touches one or two other things.
- **5 — Moderate** — real scoping required — some ambiguity in spec, moderate breadth, familiar
  territory but not copy-paste.
- **8 — Complex** — meaningful uncertainty — unfamiliar tech, several touchpoints, or a spec
  that's still soft. Price as a band.
- **13 — High-uncertainty** — genuinely novel — first-time integration, a load-bearing decision
  other Issues depend on, high likelihood/severity if wrong. Wide band: guaranteed floor, capped
  ceiling.
- **21 — Do not price** — a decomposition signal, not a point value. Recommend a split instead of
  a price, and do not write an estimate back to Linear for this Issue.

## Step 4: Apply the pricing table

Baseline **$150/point**, defensible range **$120–200/point**.

| Points | Price |
|---|---|
| 1 | ~$150 |
| 2 | ~$300 |
| 3 | ~$450 |
| 5 | ~$700–800 |
| 8 | ~$1,100–1,400 (band) |
| 13 | ~$1,700–2,600 (wide band) |
| 21 | Not priced — recommend decomposition |

1, 2, 3, and 5-point Issues get a flat price. 8 and 13-point Issues are always a range (floor
guaranteed, ceiling capped) — never a single number.

## Step 5: Website-impact flag

Some Issues are nominally product work but touch the client's public-facing website — a marketing
page pulling live product data, a page reflecting current tier logic, a flow handing off from the
marketing site into the app. Flag an Issue for website-impact review if any of:

- It changes data, copy, or logic a website page reads from or displays
- It requires a matching website-side update to stay consistent (pricing tiers, plan names,
  feature availability)
- A website page would break or show stale/incorrect info if this Issue shipped alone
- It touches a shared design system or component library used by both product and site

When flagged:
- Name explicitly what on the website is affected
- Do **not** price the website-side work as part of this Issue. Recommend it as a separate, linked
  Issue (create a draft description for the user to approve — see Step 7 — even if it's small), so
  it isn't silently absorbed or forgotten because it lives in a different codebase/space
- Bump breadth and interconnectedness to reflect the Issue now spanning two systems that must stay
  in sync
- If the website page is prestige/creative-direction-driven ("does it feel right") rather than
  informational, also raise likelihood — taste-based iteration carries more missed-the-mark risk
  than a spec-clear content update

## Step 6: Produce the report before touching Linear

For every in-scope Issue, produce:

1. **Issue name / ID** (with a link)
2. **Combine-or-split check**
3. **Six-axis read** (one phrase per axis)
4. **Website-impact flag** (yes/no; if yes, what's affected + what to spin out)
5. **Recommended point value**
6. **Recommended price** (flat for 1–5, band for 8–13; "not priced — recommend split" for 21)
7. **One-paragraph case**, written so a non-technical, client-facing reader can follow it

Show this full report to the user and get confirmation before writing anything back — this is a
shared system other people read, so don't push estimates or comments without a go-ahead. Let the
user override individual point values before you write.

## Step 7: Write back to Linear

Only after the user confirms, for each approved Issue (skipping any at 21 points):

- `save_issue` to set the Issue's estimate to the confirmed point value
- `save_comment` on the Issue recording the six-axis read, the price (band if applicable), and the
  one-paragraph case, so the reasoning travels with the Issue instead of living only in this chat
- If website-impact was flagged and the user wants the linked Issue created, `save_issue` (create)
  a new Issue in the appropriate team/project for the website-side work, linked back to the
  original, and leave its point value for a separate pricing pass rather than guessing it here

For any Issue that scored 21: don't set an estimate. Instead leave a comment recommending the
split and explain the fault line (which parts are actually independent Issues).

## What not to do

- Don't sum sub-issue/story estimates to produce an Issue price
- Don't average the six axis scores into a point value — qualitative check, not a formula input
- Don't price a 21 — decompose it
- Don't quote 8s and 13s as flat numbers — always a band
- Don't silently fold website-side work into a product Issue's price — always call it out as its
  own linked item
- Don't write estimates or comments to Linear before the user has seen and confirmed the report
