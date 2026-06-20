# Plan 12 — Email (Resend + confirmation + invoice)

**Status:** `pending`

**Goal:** Configure transactional email on staging/production and verify enrollment confirmation emails (and related invoice email work when ready).

**Prerequisites:** Plan 11 complete (or parallel if blocked only on Kyle/account access).

> Previously tracked as Plan 8.6. Deferred until Resend account access (Kyle or new free account).

## Env vars (Vercel Preview + Production)

| Variable | Sensitive | Notes |
|----------|-----------|-------|
| `RESEND_API_KEY` | Yes | From Resend dashboard |
| `EMAIL_FROM` | No | e.g. `noreply@midwestea.com` (verified sender domain) |

Redeploy after setting.

## Steps

| Step | What | Who |
|------|------|-----|
| **12.1** | Resend account access (Kyle or new account) | You |
| **12.2** | Add env vars on Vercel; verify `GET /api/health/resend` | You |
| **12.3** | Test purchase → confirmation email + `email_logs` row | You |
| **12.4** | Invoice numbers on webhook transactions (if bundled with invoice email work) | Agent + you |

See [`docs/resend-smtp-setup.md`](../resend-smtp-setup.md). Supabase Auth SMTP may share the same Resend key in the Supabase dashboard.

## Checklist

- [ ] Resend account accessible
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` on Vercel
- [ ] Confirmation email sent on test purchase
- [ ] `email_logs` shows `success: true`
- [ ] (Optional) Invoice numbering restored on webhook-created transactions

## Done criteria

- Confirmation email reliable on staging
- Production env vars ready before Plan 13 cutover
- Invoice/email integration decisions documented
