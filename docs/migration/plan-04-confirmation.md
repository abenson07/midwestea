# Plan 4 — Add `/purchase-confirmation/general`

**Goal:** Checkout success URL (`/purchase-confirmation/general`) returns 200. Currently hardcoded in [`create-checkout-session/route.ts`](apps/webapp/app/api/checkout/create-checkout-session/route.ts) line 421 but **page does not exist**.

**Prerequisites:** Plan 1 (marketing components available).

## Implementation

Follow existing pattern from [`midwestea-site/app/purchase-confirmation/oxygen/page.tsx`](midwestea-site/app/purchase-confirmation/oxygen/page.tsx) (will live under `(marketing)/` after Plan 1).

### 4.1 Create content module
`apps/webapp/lib/marketing/pages/purchase-confirmation-general-content.ts`

Port verbatim content from [`midwestea-site/docs/migration/purchase-confirmation/general.md`](midwestea-site/docs/migration/purchase-confirmation/general.md):
- h1: "Order confrimed" (keep Webflow typo or fix to "confirmed" — your call, document it)
- Body paragraph with kbrower@midwestea.com
- Links to contact, FAQ, course pages

### 4.2 Register in site-config
Add route `/purchase-confirmation/general` to [`lib/marketing/site-config.ts`](midwestea-site/lib/site-config.ts) using Header 64 component (same as `/order-confirmation` template).

### 4.3 Create page
`apps/webapp/app/(marketing)/purchase-confirmation/general/page.tsx`

Metadata from migration doc:
```typescript
robots: { index: false, follow: false, noarchive: true, nosnippet: true }
```

### 4.4 Verify checkout success URL
Confirm [`create-checkout-session/route.ts`](apps/webapp/app/api/checkout/create-checkout-session/route.ts) uses:
```typescript
const successUrl = `${origin}/purchase-confirmation/general`;
```
No `/app` prefix (Plan 2 handles this).

## Testing (Plan 4)

**Automated:**
- [ ] `npm run build` includes `/purchase-confirmation/general`
- [ ] `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/purchase-confirmation/general` → `200` (after `npm run start`)

**Manual:**
- [ ] Page renders with marketing nav/footer
- [ ] Content matches migration spec
- [ ] `robots` meta tag present (view source)
- [ ] Simulate full flow: complete test checkout → Stripe redirects to `/purchase-confirmation/general` (requires Plan 6 env + Plan 8)

**Optional follow-up (not blocking staging):** remaining 13 purchase-confirmation variants; course-specific success URLs later.

## Done criteria
- `/purchase-confirmation/general` returns 200 in production build
- Checkout session `success_url` matches this route

---
