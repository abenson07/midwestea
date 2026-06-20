---
name: migrate-midwest
description: >-
  Migrates one Midwest EA Webflow page into Next.js using docs/migration specs.
  Use when the user sends /migrate-midwest followed by a page name (about, bls,
  faq, emergency-medical-responder, etc.).
---

# /migrate-midwest

Migrate **one** Webflow page into this Next.js app.

## Parse

Accept `/migrate-midwest <page-name>`.

- **Command**: `/migrate-midwest`
- **Argument**: page name only (everything after the command)

Examples:

```
/migrate-midwest about
/migrate-midwest bls
/migrate-midwest purchase-confirmation/general
```

If the user sends only `/migrate-midwest` with no page name, reply:

```
Usage: /migrate-midwest <page-name>

Examples: /migrate-midwest about
          /migrate-midwest basic-life-support
          /migrate-midwest emr
```

**Only migrate the requested page.** Do not batch other pages unless the user asks.

---

## Step 0: Resolve the page

Run:

```bash
node scripts/resolve-migration-page.mjs "<page-name>"
```

Use the returned `migrationDoc` and `webflowHtml` paths. If score is low or alternates exist, confirm the correct slug with the user before proceeding.

Read **in full**:

1. `docs/migration/<slug>.md` — source of truth (section map, verbatim content, checklist)
2. `docs/migration/_README.md` — only if blockers mention infrastructure or template gaps

Cross-check against `midwestea.webflow/<slug>.html` for anything the doc may have missed. **Do not invent content** — copy text, links, and assets from the migration doc and Webflow HTML.

---

## Step 1: Infrastructure (first migration only)

Skip if already done in this repo.

Before the first page migration, ensure:

1. **`ComponentSection` supports `props`** in `lib/site-config.ts`
2. **`PageRenderer` spreads props**: `<Component {...section.props} />`
3. **Custom components** can be registered in `lib/component-registry.ts` (or a parallel registry for non-Relume sections)

If missing, implement these first, then continue the page migration.

Nav/footer (`components/navigation.tsx`, `components/footer.tsx`) are **layout-level** — build when migrating the first page that needs chrome, or when the user asks. Do not block a content-only page on nav if the user wants sections first.

---

## Step 2: Implement the page

Follow the migration doc **section map in order**.

### For each section by `Action`

| Action | Work |
|--------|------|
| `update-content` | Pass verbatim props from the doc into the Relume component via `site-config` or a page-specific content module. Do not leave Lorem ipsum if Webflow has real copy. |
| `update-styling` | Adjust component Tailwind/classes to match Webflow; prefer shared component changes so all pages using that component stay consistent. |
| `build-custom` | Create `components/<name>.tsx` from Webflow HTML/CSS in `midwestea.webflow/css/midwestea.css`. Register in registry. Replace `CustomPlaceholder` if present. |
| `extend-component` | Extend existing component (e.g. Header 64 cross-refs on policy pages) with optional props — minimal API surface. |
| `skip-chrome` | Nav/footer — handle in `app/layout.tsx`, not PageRenderer. |

### Route + config

1. **Create route** at the doc's **Target route** (flat slugs, e.g. `/basic-life-support`):
   - Standard: `app/<slug>/page.tsx` using `PageRenderer` + `getPageByRoute`
   - Special: `app/not-found.tsx` for 404, dynamic `app/policies/[slug]/page.tsx` for policy CMS template

2. **Add or update `pages` entry** in `lib/site-config.ts`:
   - Match section **order** from the migration doc
   - Include `props` per section with verbatim content from the doc
   - Fix known template gaps noted in the doc (e.g. add Trainers to program pages, FaqHero for `/faq`)

3. **Page metadata** — set `title`, `description`, Open Graph in `page.tsx` or layout from the doc's `Page metadata` section.

### Assets

- Copy images from `midwestea.webflow/images/` to `public/images/` when present locally
- Keep CDN URLs as-is when the export references external assets
- Update paths in props to `/images/...` for local assets

### Interactions

- Port GSAP/Swiper/scroll scripts only when the section doc lists them
- Prefer React-friendly implementations (e.g. `useEffect` + GSAP) over copying inline Webflow scripts verbatim

---

## Step 3: Verify

1. Run `npm run build` — fix TypeScript and lint errors
2. Run `npm run dev` and open the target route
3. Compare section order, copy, links, and images against the migration doc and Webflow HTML
4. Summarize for the user:
   - Route URL
   - Sections migrated vs custom components still stubbed
   - CMS/`w-dyn-*` fields deferred
   - Any doc vs Webflow discrepancies found

---

## Page name cheat sheet

| User might say | Slug |
|----------------|------|
| home, index | `index` |
| about | `about` |
| programs (gallery) | `programs` |
| courses (gallery) | `courses` |
| bls, basic life support | `basic-life-support` |
| emr | `emergency-medical-responder` |
| emt | `emergency-medical-technician` |
| terms | `terms-of-service` |
| privacy | `privacy-policy` |
| policies list | `policies` |
| policy detail (CMS) | `detail_policies` |
| order confirmation | `purchase-confirmation/general` |

Full list: `find docs/migration -name '*.md' ! -name '_README.md' ! -name 'DOC-TEMPLATE.md'`

---

## Conventions

- **Relume components** live in `components/` with kebab-case files (`layout-520.tsx`)
- **Registry keys** match Relume names (`"Layout 520"`, `"FAQ 6"`)
- **One page per invocation** — user audits incrementally
- **Do not edit** `docs/migration/*.md` during migration unless fixing a doc bug; regenerate with `npm run migration:docs` after Webflow re-export
- **Do not commit** unless the user asks

---

## Reference

- Migration index: [docs/migration/_README.md](../../../docs/migration/_README.md)
- Doc template: [docs/migration/DOC-TEMPLATE.md](../../../docs/migration/DOC-TEMPLATE.md)
- Regenerate docs: `npm run migration:docs`
