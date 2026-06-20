# Migration Doc Template

Every page-specific migration file in this folder follows the structure below. See [`_README.md`](_README.md) for process, mapping tables, and execution order.

---

```markdown
# {Page Title}

## Source & target
- **Webflow file**: `midwestea.webflow/{path}.html`
- **Target route**: `/{slug}`
- **Reference template**: `{route}` or `NEW TEMPLATE REQUIRED`
- **Template gap notes**: (if reference template is incomplete)

## Page metadata (from `<head>`)
- title, description, og:*, robots (verbatim)

## Global chrome (excluded from PageRenderer sections)
- Navigation: `navigation.navigation-component` → `components/navigation.tsx`
- Footer: `footer.footer_component` → `components/footer.tsx`
- Promo banner: `div.banner` inside nav

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|

## Section content (verbatim extraction)

### Section N: {name}
- **Webflow HTML line**: ~{line}
- **Webflow classes**: `{classes}`
- **Component file**: `components/{file}.tsx`
- **Action**: {action}
- **Headings / Paragraphs / FAQs / Tabs / Links / Images** (verbatim from Webflow)

## Assets
| Webflow src | Alt | Section # |

## Interactions / JS

## Implementation checklist

## Dependencies / blockers
```

### Action values

| Action | Meaning |
|--------|---------|
| `use-existing` | Component exists; default styling OK |
| `update-content` | Pass page-specific props from Webflow text |
| `update-styling` | Adjust styling to match Webflow |
| `build-custom` | Build new component from Webflow HTML |
| `extend-component` | Extend existing component variant |
| `skip-chrome` | Nav/footer — root layout only |

---

Docs are generated from Webflow HTML via `node scripts/generate-migration-docs.mjs`.
