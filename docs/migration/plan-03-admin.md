# Plan 3 — Rename dashboard → admin

**Goal:** Admin UI lives at `/admin/*`. Old `/dashboard/*` URLs redirect permanently.

**Prerequisites:** Plan 2 complete.

## Step-by-step

### 3.1 Move routes
- `app/(platform)/dashboard/` → `app/(platform)/admin/`

### 3.2 Update internal links (~30+ references)

Search and replace in `apps/webapp/`:
- `href="/dashboard` → `href="/admin`
- `router.push("/dashboard` → `router.push("/admin`
- `pathname === "/dashboard/login"` → `"/admin/login"`
- `pathname === "/dashboard/otp"` → `"/admin/otp"`

**Key files:**
- [`apps/webapp/app/(platform)/admin/layout.tsx`](apps/webapp/app/(platform)/dashboard/layout.tsx) (after rename)
- [`apps/webapp/components/Sidebar.tsx`](apps/webapp/components/Sidebar.tsx)
- [`apps/webapp/components/MobileNav.tsx`](apps/webapp/components/MobileNav.tsx)
- All pages under `admin/` that use `router.push("/dashboard/...")`

### 3.3 Add redirects in next.config.ts

```typescript
{ source: '/dashboard', destination: '/admin', permanent: true },
{ source: '/dashboard/:path*', destination: '/admin/:path*', permanent: true },
```

Also add legacy Webflow Cloud redirect:
```typescript
{ source: '/app/dashboard/:path*', destination: '/admin/:path*', permanent: true },
{ source: '/app/checkout/:path*', destination: '/checkout/:path*', permanent: true },
{ source: '/app/admin/:path*', destination: '/admin/:path*', permanent: true },
```

### 3.4 Update Supabase auth redirect URLs

Document for Plan 6 — Supabase dashboard must allow:
- `https://<staging-domain>/admin/login`
- `https://<staging-domain>/admin/otp`
- `http://localhost:3000/admin/login` (dev)

### 3.5 Update docs
- [`END_TO_END_TESTING.md`](END_TO_END_TESTING.md), [`TESTING_CHECKOUT_FLOW.md`](TESTING_CHECKOUT_FLOW.md) — replace `/app/checkout` and `/dashboard` references

## Testing (Plan 3)

**Automated:**
- [ ] `npm run build` passes
- [ ] Grep `apps/webapp` for `"/dashboard` in ts/tsx → only appears in redirect config comments or next.config redirects

**Manual:**
- [ ] `/admin/login` loads OTP login
- [ ] Complete OTP flow → lands on `/admin/courses` (or default admin page)
- [ ] Sidebar links all go to `/admin/*`
- [ ] `/dashboard/login` → 308 redirect to `/admin/login`
- [ ] `/dashboard/courses/xyz` → redirects to `/admin/courses/xyz`
- [ ] Unauthenticated visit to `/admin/students` → redirect to `/admin/login`
- [ ] `/checkout/success` "back to dashboard" button (if any) goes to `/admin`

## Done criteria
- All admin UI accessible at `/admin/*`
- No broken internal navigation
- Legacy `/dashboard` and `/app/dashboard` redirect correctly

---
