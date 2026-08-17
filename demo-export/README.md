# Admin views — portable demo export

A self-contained copy of the admin UI (events, people, businesses, committees,
invoicing, leaflets, content, comms, inbox, action items, QR codes, shirt
preorders, settings, mobile) with **zero backend**. Every view renders from
local fixture data and a localStorage-backed demo store — no Supabase, no
Stripe, no real API calls. 445 files, ~2.6MB.

This is the same code as the live `/admin` section, exported with its
built-in demo mode forced permanently on, not the older `/admin-preview`
pattern library (that one had gone stale before this export was made).

## Setup in the target project

1. Copy this folder's contents in. `src/`, `hooks/`, and `schemas/` are
   top-level siblings here — merge them with your target project's existing
   folders of the same name, or drop this whole tree in as-is if there's no
   collision.
2. Merge the `paths` block from this folder's `tsconfig.json` into your
   project's own `tsconfig.json` (adjust the `./` prefixes if you don't drop
   this at your project root):
   ```json
   "@/*": ["./src/*"],
   "hooks": ["./hooks"],
   "hooks/*": ["./hooks/*"],
   "schemas/*": ["./schemas/*"]
   ```
3. Install the dependencies listed in this folder's `package.json` (merge
   into your own — don't `npm install` from inside this folder).
4. Bring over the Tailwind v4 `@theme` tokens: `src/app/globals.css` carries
   the custom colors/spacing/etc. the components' class names depend on.
   Merge it into your own global stylesheet, or import it directly if you
   don't already have a `globals.css`.
5. Keep the route at `/admin-preview` (see below for why) — or if you rename
   it, also update the prefix check in
   `src/components/patterns/client-templates/shared/useAdminBasePath.ts`.

Then `/admin-preview/events` (etc.) should render with demo data, no auth,
no database.

## Why `/admin-preview` specifically

`useAdminBasePath()` (`src/components/patterns/client-templates/shared/useAdminBasePath.ts`)
is this codebase's own convention for "am I in the safe/frozen build or the
real one?" — it checks whether the current path starts with `/admin-preview`.
Several components (notably the sidebar's favorites list) use that check to
decide whether to call real, Supabase-backed hooks. Keeping the route at
`/admin-preview` means this export gets that protection everywhere it's
already wired in, instead of needing every call site patched individually.

## How "no backend" is enforced, concretely

- **`src/lib/supabaseClient.ts`** is stubbed to always be `null` (typed as
  `SupabaseClient | null` so call sites still type-check normally). Every
  hook's `if (!supabaseClient)` check takes the safe/empty path.
- **Demo mode is forced on**: `src/app/admin-preview/layout.tsx` sets
  `DemoModeProvider defaultEnabled={true}` (and `WipFeaturesProvider
  defaultEnabled={true}` so every view, including the ones normally gated
  behind a "preview features" toggle, is visible). Nearly every data hook in
  `hooks/` and every write handler in the view components already branch on
  this flag: when on, reads come from `src/data/mocks/*` and writes go to
  `src/lib/demo/demoStore.ts` (localStorage) instead of touching Supabase or
  Stripe. This is existing app behavior, not something added for this
  export — see e.g. `hooks/useAllSponsorships.ts` or the write handlers in
  `src/components/patterns/client-templates-migrate/people/PeopleDemo.tsx`.
- **`ReportIssueModal`** (`src/components/patterns/foundation/ReportIssueModal.tsx`)
  was the one network call in the whole bundle that wasn't already
  demo-gated (it posted bug reports to Linear). Patched to a local no-op
  toast instead.
- **A handful of secondary hooks** call this app's own `/api/*` routes
  directly for specific operations, outside the demo-mode branch: committee
  meetings/initiatives/interests/settings, leaflet history, deliveries,
  fundraiser Stripe totals, Webflow events. No API routes ship with this
  bundle, so if you trigger one of those specific actions it'll just fail
  quietly (a 404/network error in the console) — nothing to fix unless you
  want that particular sub-feature to look fully alive in the target
  project too.

## What's inside

- `src/components/patterns/client-templates-migrate/` — the view/layout
  components themselves, one folder per domain.
- `src/components/patterns/foundation/` — shared chrome: sidebar
  (`LinearSidebar.tsx`), layout shell, headers, modals, theme/demo-mode
  context providers.
- `src/components/patterns/primitives/`, `shared/`, `grouped-table/` — base
  UI kit (buttons, inputs, cards, tables, etc.).
- `src/components/patterns/client-templates/` — a few specific files still
  pulled from the older, pre-migrate pattern-library tree that the current
  views happen to still reuse (`BudgetChart`, `MetricCard`, `NewStoryModal`,
  `DraftsSection`, `AddPromotionModal`, `NewEventModal`, plus its own small
  `shared/` subfolder). Not the whole old tree — just these.
- `src/components/integrated/events/`, `src/components/leaflet/`,
  `src/components/billing/`, `src/components/sponsorship/`,
  `src/components/form/`, `src/components/ui/` — supporting components these
  views reach into (event context/state, leaflet data helpers, invoice
  tables, sponsor modals, form primitives).
- `src/data/mocks/` — the fixture data every view actually renders.
- `src/lib/demo/` — the localStorage-backed demo store (`demoStore.ts`) that
  makes adds/edits persist across a refresh without a database.
- `hooks/` — the ~40 data hooks these views call. Copied as-is; the
  demo/live branching already inside them is what makes the rest of this
  work without rewriting any view.
- `schemas/` — plain TS types, no runtime code.
- `src/theme/linearTokens.ts` — design tokens, dependency-free.
- `src/app/admin-preview/**` — the Next.js route tree (21 pages) wiring it
  all together.

## Verification already done

This folder was typechecked standalone (`tsc --noEmit` against its own
`tsconfig.json`, resolving only its own files plus real npm packages — zero
errors) to confirm there's no hidden dependency on any file outside this
folder. It has not been run through a full `next build` in isolation, so a
first build in the target project is still worth watching for anything
environment-specific (font loading, Tailwind setup, etc.).
