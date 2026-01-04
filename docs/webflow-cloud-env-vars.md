# Webflow Cloud Environment Variables Guide

This guide explains which environment variables should be set as **Public** (visible to client-side code) vs **Secret** (server-side only) in Webflow Cloud.

## Public Environment Variables (NEXT_PUBLIC_*)

These variables are exposed to the browser and can be accessed by client-side code. They are safe to be public because they are either:
- Public keys/URLs that are meant to be shared
- Non-sensitive configuration values

### Supabase (Public)
- **`NEXT_PUBLIC_SUPABASE_URL`** - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Supabase anonymous/public key (starts with `eyJ...`)

### Stripe (Public)
- **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** - Stripe publishable key (starts with `pk_test_` or `pk_live_`)

---

## Secret Environment Variables

These variables should **NEVER** be exposed to the client-side. They contain sensitive credentials and API keys.

### Supabase (Secret)
- **`SUPABASE_SERVICE_ROLE_KEY`** - Supabase service role key (bypasses Row Level Security, starts with `eyJ...`)
  - ⚠️ **CRITICAL**: This key has admin access to your database. Keep it secret!

### Stripe (Secret)
- **`STRIPE_SECRET_KEY`** - Stripe secret key (starts with `sk_test_` or `sk_live_`)
  - Used for server-side operations like creating checkout sessions, payment intents, etc.
- **`STRIPE_WEBHOOK_SECRET`** - Stripe webhook signing secret (starts with `whsec_`)
  - Used to verify webhook requests are from Stripe

### Email Provider - Resend (Secret)
- **`RESEND_API_KEY`** - Resend API key (starts with `re_`)
  - Used to send transactional emails

### Email Configuration (Optional - Can be Public)
- **`EMAIL_FROM`** - Email address to send from (e.g., `noreply@midwestea.com`)
  - This is just an email address, so it can be public, but setting it as secret is fine too

### Webflow (Secret)
- **`WEBFLOW_API_TOKEN`** - Webflow API access token
  - Used to sync classes to Webflow CMS
- **`WEBFLOW_SITE_ID`** - Webflow site ID
  - Identifies which Webflow site to sync to
- **`WEBFLOW_CLASSES_COLLECTION_ID`** - Webflow collection ID for classes
  - Identifies the CMS collection to sync classes to

---

## Summary Table

| Variable | Type | Used For | Example |
|----------|------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Public** | Client-side Supabase connection | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Public** | Client-side Supabase auth/queries | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Server-side admin operations | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Public** | Client-side Stripe.js initialization | `pk_test_51...` |
| `STRIPE_SECRET_KEY` | **Secret** | Server-side Stripe operations | `sk_test_51...` |
| `STRIPE_WEBHOOK_SECRET` | **Secret** | Webhook signature verification | `whsec_...` |
| `RESEND_API_KEY` | **Secret** | Sending emails via Resend | `re_...` |
| `EMAIL_FROM` | Public/Secret | Email sender address | `noreply@midwestea.com` |
| `WEBFLOW_API_TOKEN` | **Secret** | Webflow API authentication | `...` |
| `WEBFLOW_SITE_ID` | **Secret** | Webflow site identification | `...` |
| `WEBFLOW_CLASSES_COLLECTION_ID` | **Secret** | Webflow collection identification | `...` |

---

## How to Set in Webflow Cloud

1. **Public Variables**: Set these in the "Environment Variables" section as **Public**
   - They will be prefixed with `NEXT_PUBLIC_` automatically if needed
   - Accessible via `process.env.NEXT_PUBLIC_*` in both client and server code

2. **Secret Variables**: Set these in the "Environment Variables" section as **Secret**
   - They will NOT be exposed to the browser
   - Only accessible via `process.env.*` in server-side code (API routes, server components)

---

## Notes

- **Never** commit secret keys to git repositories
- **Always** use test keys (`sk_test_`, `pk_test_`) during development
- **Rotate** keys immediately if they are accidentally exposed
- The Supabase **ANON key** is safe to be public because Row Level Security (RLS) policies protect your data
- The Supabase **SERVICE_ROLE key** bypasses RLS, so it must be secret

---

## Quick Checklist

When setting up Webflow Cloud environment variables:

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` as **Public**
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` as **Public**
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` as **Secret**
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` as **Public**
- [ ] Set `STRIPE_SECRET_KEY` as **Secret**
- [ ] Set `STRIPE_WEBHOOK_SECRET` as **Secret**
- [ ] Set `RESEND_API_KEY` as **Secret**
- [ ] Set `EMAIL_FROM` as **Public** (or Secret, doesn't matter)
- [ ] Set `WEBFLOW_API_TOKEN` as **Secret**
- [ ] Set `WEBFLOW_SITE_ID` as **Secret**
- [ ] Set `WEBFLOW_CLASSES_COLLECTION_ID` as **Secret**

