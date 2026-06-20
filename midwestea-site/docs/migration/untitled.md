# Untitled

## Source & target
- **Webflow file**: `midwestea.webflow/untitled.html`
- **Target route**: `N/A (dev sandbox)`
- **Reference template**: `N/A`
- **Purpose**: Extract shared UI into reusable React components — not a standalone page route.

## Purpose: dev sandbox (not production)

Contains navbar dropdown layout prototypes and alternate mobile menu markup.
- `div.div-block-2` × 2 — dropdown layout experiments
- Alternate `div.navigation` with mobile menu

### Migration action
- Reference only for navigation responsive behavior
- Do **not** create a route

## Implementation checklist
- [ ] Extract markup into shared React component(s)
- [ ] Wire into `app/layout.tsx` (navigation/footer) or Next.js utility routes
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- No PageRenderer entry needed unless building a standalone utility page
