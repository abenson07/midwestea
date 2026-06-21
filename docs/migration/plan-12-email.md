# Plan 12 — Email (Resend + confirmation + invoice)

**Status:** `pending`

**Goal:** Configure transactional email on staging/production and verify enrollment confirmation emails (and related invoice email work when ready).

**Prerequisites:** Plan 11 complete (or parallel if blocked only on Kyle/account access).

> Previously tracked as Plan 8.6. Deferred until Resend account access (Kyle or new free account).

## Resend account strategy

| Phase | Account | Notes |
|-------|---------|-------|
| **Now (staging / dev)** | Personal Resend account | Domain verified here; API key in Vercel + Supabase SMTP |
| **Cutover (Plan 13)** | Client Midwest EA Resend account | Re-verify domain, rotate keys, update Vercel + Supabase — see [Plan 13 §13.4](plan-13-cutover.md#138-resend--client-account-at-cutover) |

A domain can only be verified in **one** Resend account at a time. Do not add `midwestea.com` to the client account until cutover (or remove it from the personal account first).

## Env vars (Vercel Preview + Production)

| Variable | Sensitive | Notes |
|----------|-----------|-------|
| `RESEND_API_KEY` | Yes | From Resend dashboard |
| `EMAIL_FROM` | No | e.g. `noreply@midwestea.com` (verified sender domain) |

Redeploy after setting.

## Steps

| Step | What | Who |
|------|------|-----|
| **12.1** | Resend account access (personal account for now) | You |
| **12.2** | Verify `midwestea.com` in Resend — add DNS records (below) | You |
| **12.3** | Generate API key; configure Supabase Auth SMTP + Vercel env vars | You |
| **12.4** | Verify `GET /api/health/resend`; test admin OTP + `npm run test-otp-email` | You |
| **12.5** | Test purchase → confirmation email + `email_logs` row | You |
| **12.6** | Invoice numbers on webhook transactions (if bundled with invoice email work) | Agent + you |

See [`docs/resend-smtp-setup.md`](../resend-smtp-setup.md). Supabase Auth SMTP uses the same Resend API key as `RESEND_API_KEY` (pasted in the Supabase dashboard, not read from Vercel).

### 12.2 — Resend domain DNS (`midwestea.com`)

In Resend → **Domains** → **Add Domain** → `midwestea.com`. Resend shows the exact host/value pairs; add them at the domain DNS host (registrar, Cloudflare, Webflow, etc.).

| Record | Type | Value / notes |
|--------|------|----------------|
| **SPF** | TXT (on `@` or root) | `v=spf1 include:_spf.resend.com ~all` |
| **DKIM** | TXT (host from Resend, e.g. `resend._domainkey`) | Unique per account — copy from Resend dashboard |
| **DMARC** (recommended) | TXT on `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@midwestea.com` |

**Checklist for 12.2:**

- [ ] Domain added in Resend (personal account)
- [ ] SPF, DKIM, and DMARC records published at DNS host
- [ ] Resend dashboard shows domain status **Verified** (often 5–15 min after DNS propagates)
- [ ] Sender `noreply@midwestea.com` allowed (must match verified domain)

**Cutover note:** When moving to the client Resend account (Plan 13), DKIM (and possibly SPF) values **will change**. Plan a DNS update and key rotation at cutover — do not assume today’s DKIM record stays valid.

## Checklist

- [ ] Resend account accessible (personal account for pre-cutover)
- [ ] `midwestea.com` verified in Resend (DNS records live)
- [ ] Supabase Auth custom SMTP configured (`smtp.resend.com`, sender `noreply@midwestea.com`)
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` on Vercel
- [ ] Admin OTP login sends email (`/admin/login` or `npm run test-otp-email`)
- [ ] Confirmation email sent on test purchase
- [ ] `email_logs` shows `success: true`
- [ ] (Optional) Invoice numbering restored on webhook-created transactions

## Done criteria

- Confirmation email reliable on staging
- Production env vars ready before Plan 13 cutover
- Invoice/email integration decisions documented
