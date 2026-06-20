# Style Guide

## Source & target
- **Webflow file**: `midwestea.webflow/style-guide.html`
- **Target route**: `N/A (design reference)`
- **Reference template**: `N/A`
- **Purpose**: Extract shared UI into reusable React components — not a standalone page route.

## Purpose: design token reference

Relume Style Guide v3.0 — use to align Tailwind/Relume tokens with Webflow CSS variables in `midwestea.webflow/css/midwestea.css`.

### Sections in Webflow export
- `#typography` — headings, text sizes/weights/styles, rich text
- `#colors` — color scheme swatches (color-scheme-1 through color-scheme-10)
- `#UI-elements` — buttons, tags, forms, icons
- `#radius` — border radius demos
- `#effects` — box shadows
- `#structure-classes` — padding, max-width, margin/spacer utilities

### Migration action
- Map Webflow `--color-scheme-*` CSS variables to Relume/Tailwind theme in `tailwind.config.ts` and `app/globals.css`
- Do **not** create a public route for this page

## Implementation checklist
- [ ] Extract markup into shared React component(s)
- [ ] Wire into `app/layout.tsx` (navigation/footer) or Next.js utility routes
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- No PageRenderer entry needed unless building a standalone utility page
