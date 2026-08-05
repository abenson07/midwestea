# Boilerplate: writing an end-to-end test plan for a stacked-branch L1 sequence

This is the standing instruction set for producing a human end-to-end test plan when a body
of work has been built as a chain of Linear L1 issues on stacked branches. The output is a
single markdown file structured so it can be piped into Linear as one parent issue, one
sub-issue per section, and one sub-sub-issue per step.

`docs/E2E_TIERED_ENROLLMENT_TEST_PLAN.md` is the current worked example. BEN-1198 is the
reference standard for granularity.

---

## 1. What you are producing

**One markdown file.** Three levels of heading, and the heading level *is* the Linear
hierarchy. Nothing else in the file may use `#`, `##`, or `###`.

| Markdown | Linear | Count |
| -- | -- | -- |
| `# Title` (once, at top) | the parent issue | 1 |
| `## N. Section title` | a sub-issue of the parent | 1 setup + 1 per L1 + 1 closeout |
| `### N.M Step title` | a sub-issue of that section | 2–8 per section |

Everything under a heading, up to the next heading of the same or higher level, is that
issue's description. Write it so it stands alone — a person reading only that one Linear
issue must be able to complete it without scrolling anywhere else.

Use `####` and below freely inside a step; those are body content, not hierarchy.

---

## 2. Research before you write a single line

Do not write from the Linear descriptions alone. They describe intent; the repo describes
what shipped. Gather all of this first:

1. **Branch chain and order.** `git merge-base --is-ancestor <a> <b>` for each adjacent
   pair. Confirm the order, don't assume it from issue numbers.
2. **New migrations per branch.**
   `git diff --name-only --diff-filter=A <prev-branch> <branch> -- supabase/migrations/`
   Read every one. You will paste their SQL into the plan verbatim — the tester should
   never have to open a file to know what they're running.
3. **Migration drift between branches.** A migration file can be *edited* on a later branch
   (a bug fix). `git show <later-branch>:<path>` and diff it against the branch that
   introduced it. If they differ, say which version to run and why.
4. **New routes, pages, and API endpoints per branch.**
   `git diff --name-only --diff-filter=A <prev> <branch> -- apps/webapp/app ...`
5. **Exact request/response shapes** for every endpoint you'll `curl`: HTTP method, query
   params vs. body params, auth header, the literal error strings and status codes. Read
   the route file. Never infer a body shape from a plan document.
6. **Identifier semantics.** Whether a route segment takes a UUID or a human code is the
   single most common source of a broken test step. Check each one and state it in the plan.
7. **npm scripts** in both the root and workspace `package.json`. Use the real script name.
8. **Env var names actually read by the code** (`git grep "process.env."`), and what is
   *currently* in `.env.local`. A var the code needs but the file lacks is a setup step, and
   finding it is your job, not the tester's.
9. **Anything with an external side effect** — emails, webhooks, payment links, storage
   buckets — and where it is configured. If it's configured outside the repo (in Stripe, in
   Supabase), that is a setup step with its own instructions.

Never run SQL against the user's database, and never check out or modify a work branch to
gather this. `git show <branch>:<path>` reads any file on any branch without touching the
working tree.

---

## 3. Hard rules

These are the rules that separate a usable plan from a useless one. Every previous failure
has been a violation of one of them.

### 3.1 No unresolved placeholders

A value that is knowable at writing time must appear literally in the command. Not
`<your test email>` — `alexbensonux+preqA@gmail.com`. Not `<branch>` — `687-tiered-enrollment`.
Not "your class code" — `PARA-002`.

A value that genuinely cannot be known until runtime (a generated UUID, a bearer token) gets
exactly one treatment:

- The step that first produces it **captures it into a named shell variable or a ledger row**.
- Every later step references `$THAT_VARIABLE` — never a `<placeholder>`.
- The setup section ends with a **value ledger**: a single block of `export` lines the tester
  fills in as they go, and a table naming each value, the step that produces it, and the
  steps that consume it.

For SQL, where shell variables don't exist, the ledger table is the mechanism: the step says
"paste the `CLASS_UUID` value from the ledger", and the tester has one place to look.

### 3.2 Every command states its expected result

Every fenced `bash` or `sql` block is followed by what the tester should see. Not "verify it
worked" — the actual row count, the actual literal string, the actual status code, the actual
log line. If a check has no observable outcome, it is not a check; cut it or find one.

For SQL, prefer queries whose output is small and unambiguous. A `SELECT count(*)` that must
return `3` beats a `SELECT *` the tester has to interpret.

### 3.3 One step is one sitting

A step is a unit of work someone can start and finish without stopping — set up the Supabase
test project *is* one step; set up Stripe test keys is a *different* step. If a step has two
unrelated "and then" clauses, split it.

Aim for 2–8 steps per section. A section with one step is under-decomposed; one with twelve
is a section that should have been two.

### 3.4 State accumulates and you must track it

The test pass runs in order against one database. Each section inherits the exact state the
previous one left. So:

- Say at the top of each section what state it assumes and where that state came from
  (which earlier step, by number).
- Say at the end of each section what it leaves behind that later sections depend on.
- When a later section reuses a fact established earlier, restate the fact and cite the step.
  Do not make the tester search backward.
- When a step deliberately mutates shared state (backdating a date to see an "expired"
  badge), say whether and how to put it back, and which later section cares.

### 3.5 Every step gets its own Acceptance Criteria, not just the section closer

Every `###` step — every sub-sub-issue — ends with its own **Acceptance criteria:** checklist,
phrased so each line is a yes/no. This is separate from, and in addition to, the L1-level
**Pass criteria and merge** step that closes each section. A Linear sub-sub-issue with no AC of
its own is not verifiable in isolation — whoever picks it up should not have to read the whole
section to know what "done" means for that one step.

Derive each step's AC from the `Expect` statements already written into that step — it is a
compression of what's already there, not new content. Keep it to the outcomes that matter, not
a restatement of every line: 3–6 bullets is normal; a step needing more than that is probably
under-split (see §3.3).

The section-level **Pass criteria and merge** step still exists on top of this — it is the
rollup across every step's AC, plus the explicit merge action. It does not replace per-step AC.

### 3.6 Every section is closed by a decision

Each L1 section ends with a **Pass criteria** block: the specific conditions that make the
branch good to go, phrased so the answer is yes or no. Then the explicit action — mark the
Linear issue Done, and merge into the next branch in the chain, with the literal git commands.

### 3.7 Prefer a real walkthrough; fall back to the API deliberately

Drive the UI where a UI exists — that's what end-to-end means. Use `curl` when there is no UI
trigger, when you're testing an authorization boundary, or when you're forcing an error the UI
prevents. When you use `curl` in place of an existing UI, say why in one line.

Use SQL to *verify* and to *force preconditions that are otherwise slow or impossible* (making
a date fall in the past, marking something approved before the approval UI exists). Say which
of the two you're doing.

### 3.8 Never quietly rely on something the setup didn't establish

If a step needs an admin bearer token, a private storage bucket, a Stripe payment link with a
particular return URL, or a class with a start date 30 days out — that came from a setup step,
and the step should name it. If it didn't, add it to the setup section.

---

## 4. Section 1 — Set up the testing environment

Always section 1. Its job is to end with the tester able to start testing branch one without
any further decisions. Determine which of the following apply, and include a step for each
that does.

### 4.1 Do you need Stripe?

**Yes if** any tested flow touches a checkout, a payment link, an invoice, a webhook, or a
refund. **No if** every flow is admin configuration or read-only inspection.

If yes, the step covers: switching to test mode, the test secret/publishable keys, any test
Products/Prices/Payment Links that must exist (including their return URLs, which are
configured in Stripe per object, not in the repo), the Stripe CLI, and `stripe listen`
forwarding to the local webhook route with the specific event types the code handles.

Name the test card and the exact webhook route path.

### 4.2 Do you need an isolated Supabase project?

**Almost always yes.** Any test that writes a row — an enrollment, a submission, a review,
an email log — must not write it to production. The only exception is a pass that runs
read-only terminal commands.

The step covers: creating the project, cloning schema and data into it, pointing the app at
it, and confirming the app is actually talking to the new one. Reuse the repo's own migration
tooling rather than inventing a clone procedure. Flag explicitly if the clone copies real PII
so the user makes that call deliberately.

### 4.3 Migrations

Every migration the whole pass depends on, in dependency order, with the SQL inline. Split
them by the branch that introduces them, but run the ones needed for the first branch during
setup — the tester should not hit a missing table on step one.

If a migration is edited on a later branch, run the later version and say so.

### 4.4 Test accounts

Standing convention:

- **Students** — the user's personal Gmail with a `+` alias per role:
  `alexbensonux+<tag>A@gmail.com`, `alexbensonux+<tag>B@gmail.com`. Pick a `<tag>` that names
  the feature (`inv` for invoicing, `preq` for prerequisites) so aliases don't collide across
  test passes. Say what each student's *role in the narrative* is — which one carries the
  throughline, which one exists to prove one specific case.
- **Admin** — `alex@midwesternoriginals.com`, the work account. It must exist in the cloned
  `admins` table; include the check and the insert if it doesn't.

Auth is email OTP. Include how to read the code out of the Supabase Auth logs when the new
project's default mailer is throttled.

### 4.5 Env file swap

One step, both directions:

- Back up the real file: `cp apps/webapp/.env.local apps/webapp/.env.local.backup`
- List every var to set, with which system it comes from.
- Confirm the swap took, with a command that proves it.

The closeout section restores from that backup. The backup path must be identical in both places.

### 4.6 Seed and pick test data

What existing rows to reuse, what to retarget, what to create. Prefer retargeting a real row
over fabricating one — fabricating means guessing at NOT NULL columns. Give the `SELECT` that
finds candidates and the `UPDATE` that retargets one.

Choose dates so that everything starts in the state you want and you control transitions
via SQL later.

### 4.7 Start everything

Install, dev server, webhook forwarder, and the smoke check that proves the app is running
against the test project and not production. This step's expected output is the tester's
green light.

### 4.8 The value ledger

Last step of section 1. The `export` block plus the fill-in table described in §3.1.

---

## 5. Sections 2..N — One per L1, in stack order

The L1's own statement of outcome tells you what the section must prove. Read its **Rollup
criterion** and its **Human test checklist** — the checklist items are candidate steps, but
they are written by the builder and are not organized for a human sitting down to test. Your
job is to sequence them into a narrative that accumulates state.

Each section opens with:

- The Linear L1 link and its one-sentence outcome.
- The branch, and the literal `git checkout` command.
- Migrations this branch adds, or the words "No new migrations."
- What state this section inherits, citing the step that created it.
- What's new here versus the previous branch, in a sentence or two — the tester needs to know
  what they're actually looking at.

Then the steps. Then pass criteria and the merge action.

**Order steps as a story, not as a checklist.** Build the thing, use the thing, break the
thing, confirm the break is visible, fix it. The builder's checklist ordering is usually
grouped by code area; regroup it by what a person would actually do in sequence.

**Fold the builder's "additional checks" in where they belong** rather than dumping them in a
trailing step. A negative test belongs immediately after the positive test it contrasts with.
The exception is a genuinely separate concern — authorization boundaries, for instance —
which earns its own step.

**Carry the throughline.** One student, one class, one credential should thread through as
many sections as possible. That's what makes it end-to-end rather than five unit tests. State
at the end of each section what must be left in place.

---

## 6. Final section — Close-up

Always last. Covers:

- **Merge.** The full sequence of merges back down the chain, as literal commands, in order,
  with what to check between each. Note explicitly that pushing is a separate decision the
  user makes in the moment.
- **Restore the environment.** `cp` the backup back. Stop the dev server and any forwarder.
  Confirm the app is pointed at production again, with a command that proves it.
- **Promote to live.** Everything that must be done to the real environment for the merged
  work to function: migrations to run against production, env vars to add in Vercel or
  wherever they live, external configuration (Stripe objects, storage buckets, email domains)
  that exists only in the test account so far. This is the step people forget; be exhaustive
  and specific about *where* each thing is configured.
- **Disposition of the test resources.** What can be deleted, what's worth keeping.

---

## 7. Tone and formatting

Match BEN-1198. Plain, direct, second person. Explain the mechanism when the mechanism is
what makes the check meaningful — a tester who knows *why* a row should stay `cancelled`
rather than disappear can tell a pass from a near-miss. Skip the explanation when the check
is self-evident.

- Fenced blocks tagged `bash` or `sql`. One logical command per block.
- Bold the literal UI strings the tester is looking for, or quote them exactly. Copy them
  from the source, don't paraphrase.
- Backtick every route, column, table, file path, and env var.
- Full Linear URLs, never bare `BEN-123`.
- Tables for anything with three or more parallel facts (branch chains, value ledgers,
  status matrices).
- No emoji. No "simply", "just", or "should be straightforward".

---

## 8. Self-check before you hand it over

- [ ] Every `<placeholder>` is either a literal value or a `$VAR` defined in the ledger.
- [ ] Every command block is followed by an expected result.
- [ ] Every `###` step ends with its own Acceptance criteria checklist — not only the last
      step in each section.
- [ ] Every section states what it inherits and what it leaves.
- [ ] Every L1 section ends with pass criteria and a merge command.
- [ ] Every route segment is marked UUID or code.
- [ ] Every endpoint's method, params, and auth match the route file you read.
- [ ] Every migration's SQL is inline and in dependency order.
- [ ] The env backup path is identical in setup and closeout.
- [ ] Section 1 establishes everything sections 2..N assume — walk backward through the plan
      and confirm each assumed thing has a source step.
- [ ] The closeout lists every production-side change the merged work needs.
- [ ] Heading levels are used only for hierarchy: one `#`, `##` per section, `###` per step.
