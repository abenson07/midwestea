# Production Documentation

This document contains essential information for operating the MidwestEA platform in production.

**Last Updated:** January 29, 2025

---

## Table of Contents

1. [Production URLs and Endpoints](#production-urls-and-endpoints)
2. [Rollback Procedures](#rollback-procedures)
3. [Key Rotation Procedures](#key-rotation-procedures)
4. [Production Runbook](#production-runbook)

---

## Production URLs and Endpoints

### Application URLs

**Base URL:** `https://yourdomain.com` (or `https://yourdomain.com/app` if using base path)

**Admin Dashboard:**
- Login: `https://yourdomain.com/dashboard/login`
- Main Dashboard: `https://yourdomain.com/dashboard`
- Settings: `https://yourdomain.com/dashboard/settings`

**Public Pages:**
- Checkout: `https://yourdomain.com/checkout`
- Checkout Details: `https://yourdomain.com/checkout/details`
- Purchase Confirmation: `https://yourdomain.com/purchase-confirmation/general`

### API Endpoints

#### Public Endpoints (No Auth Required)

**Checkout:**
- `POST /api/checkout/create-checkout-session` - Create Stripe checkout session
- `GET /api/checkout/get-payment-link` - Get payment link for a class
- `POST /api/checkout/ensure-user` - Ensure user exists in system

**Waitlist:**
- `POST /api/waitlist/submit` - Submit waitlist entry
- `GET /api/waitlist/by-course-code/[courseCode]` - Get waitlist for course

**Config:**
- `GET /api/config` - Get runtime configuration (Supabase URLs/keys)

**Health Checks:**
- `GET /api/health/resend` - Check Resend email service health
- `GET /api/health/email` - Check email service health

#### Admin Endpoints (Require Admin Authentication)

**Email Management:**
- `GET /api/admin/email-logs` - Get email delivery logs
- `GET /api/admin/email-metrics` - Get email delivery metrics
- `POST /api/admin/email-logs/[logId]/retry` - Retry failed email

**Settings:**
- `GET /api/webhooks/stripe/test` - Test Stripe webhook endpoint accessibility

#### Webhook Endpoints (Stripe Signature Verification)

**Stripe Webhooks:**
- `POST /api/webhooks/stripe` - Main Stripe webhook handler
  - Handles events: `checkout.session.completed`, `payment_intent.succeeded`, `payout.paid`
  - **Production URL for Stripe Dashboard:** `https://yourdomain.com/api/webhooks/stripe` (or `/app/api/webhooks/stripe`)

#### Authenticated Endpoints (Require User Session)

**Classes:**
- `GET /api/classes/active` - Get active classes
- `GET /api/classes/by-class-id/[classId]` - Get class by class_id
- `GET /api/classes/by-course-code/[courseCode]` - Get classes by course code
- `GET /api/classes/[id]` - Get class details
- `POST /api/classes/create` - Create new class
- `POST /api/classes/[id]/update` - Update class
- `DELETE /api/classes/[id]/delete` - Delete class
- `POST /api/classes/[id]/sync-webflow` - Sync class to Webflow CMS

**Courses:**
- `GET /api/courses/by-course-code/[courseCode]` - Get course by code

**Students:**
- `GET /api/students/[id]/email` - Get student email
- `POST /api/students/[id]/update-email` - Update student email

**Transactions:**
- `POST /api/transactions/reconcile` - Reconcile transaction with payout
- `POST /api/transactions/unreconcile` - Unreconcile transaction

**Logs:**
- `POST /api/logs/class-delete` - Log class deletion
- `POST /api/logs/detail-update` - Log detail update
- `POST /api/logs/student-enrollment` - Log student enrollment

**Exports:**
- `GET /api/export-invoices-csv` - Export invoices to CSV
- `GET /api/export-transactions-csv` - Export transactions to CSV

**Sync:**
- `POST /api/sync-stripe-invoices` - Sync Stripe invoices

---

## Rollback Procedures

### Code Rollback

#### Option 1: Git Revert (Recommended)

```bash
# 1. Identify the commit to revert to
git log --oneline

# 2. Revert to a specific commit (creates new commit)
git revert <commit-hash>

# 3. Push the revert
git push origin main
```

#### Option 2: Reset to Previous Commit (Use with Caution)

```bash
# 1. Identify the commit to rollback to
git log --oneline

# 2. Reset to previous commit (destructive - use carefully)
git reset --hard <commit-hash>

# 3. Force push (only if you're sure)
git push origin main --force
```

**⚠️ Warning:** Force pushing rewrites history. Only use if you're the only one working on the branch.

### Database Rollback

#### Rollback a Migration

```bash
# 1. Connect to Supabase SQL Editor
# 2. Identify the migration to rollback
# 3. Manually reverse the SQL changes

# Example: If migration added a column, remove it:
ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;
```

#### Restore from Backup

1. Go to Supabase Dashboard → Database → Backups
2. Select the backup point before the issue
3. Restore the database (this will overwrite current data)
4. **⚠️ Warning:** This will lose all data created after the backup

### Environment Variable Rollback

1. Go to your hosting platform (Webflow Cloud, etc.)
2. Navigate to Environment Variables
3. Revert to previous values
4. Redeploy application

### Stripe Configuration Rollback

1. Go to Stripe Dashboard → Developers → Webhooks
2. If webhook endpoint was changed, revert to previous URL
3. If webhook secret was rotated, use previous secret
4. Update `STRIPE_WEBHOOK_SECRET` environment variable

---

## Key Rotation Procedures

### Stripe Keys

#### Rotate Stripe Secret Key

1. **Create new key in Stripe Dashboard:**
   - Go to Stripe Dashboard → Developers → API keys
   - Click "Create secret key"
   - Copy the new key (starts with `sk_live_...`)

2. **Update environment variable:**
   - Go to hosting platform → Environment Variables
   - Update `STRIPE_SECRET_KEY` with new key
   - **Keep old key temporarily** (for rollback if needed)

3. **Test the new key:**
   - Use Settings page → Test Webhook Endpoint
   - Try a test checkout flow
   - Monitor Stripe Dashboard for API calls

4. **Revoke old key (after confirming new key works):**
   - Go to Stripe Dashboard → Developers → API keys
   - Find old key and click "Revoke"
   - ⚠️ **Only revoke after confirming everything works!**

#### Rotate Stripe Publishable Key

1. **Create new key in Stripe Dashboard:**
   - Go to Stripe Dashboard → Developers → API keys
   - Click "Create publishable key"
   - Copy the new key (starts with `pk_live_...`)

2. **Update environment variable:**
   - Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with new key
   - Redeploy application

3. **Test checkout flow:**
   - Try creating a checkout session
   - Verify Stripe.js loads correctly

4. **Revoke old key:**
   - Revoke old publishable key in Stripe Dashboard

#### Rotate Stripe Webhook Secret

1. **Create new webhook endpoint in Stripe Dashboard:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Use same URL as existing endpoint
   - Copy the new signing secret (`whsec_...`)

2. **Update environment variable:**
   - Update `STRIPE_WEBHOOK_SECRET` with new secret
   - Redeploy application

3. **Test webhook:**
   - Use Settings page → Test Webhook Endpoint
   - Trigger a test payment to verify webhook works

4. **Delete old webhook endpoint:**
   - Delete old endpoint in Stripe Dashboard
   - ⚠️ **Only delete after confirming new endpoint works!**

### Supabase Keys

#### Rotate Supabase Service Role Key

1. **Generate new key in Supabase Dashboard:**
   - Go to Supabase Dashboard → Project Settings → API
   - Scroll to "Service Role" section
   - Click "Reset service role key" or generate new key
   - Copy the new key

2. **Update environment variable:**
   - Update `SUPABASE_SERVICE_ROLE_KEY` with new key
   - Redeploy application

3. **Test database access:**
   - Try logging into admin dashboard
   - Test a database operation

4. **Revoke old key:**
   - Old key is automatically invalidated when new one is generated

#### Rotate Supabase Anonymous Key

1. **Generate new key in Supabase Dashboard:**
   - Go to Supabase Dashboard → Project Settings → API
   - Scroll to "Project API keys"
   - Click "Reset anon key" or generate new key
   - Copy the new key

2. **Update environment variable:**
   - Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` with new key
   - Redeploy application

3. **Test client-side access:**
   - Try logging in
   - Test data queries

### Resend API Key

#### Rotate Resend API Key

1. **Create new key in Resend Dashboard:**
   - Go to Resend Dashboard → API Keys
   - Click "Create API Key"
   - Copy the new key (starts with `re_...`)

2. **Update environment variable:**
   - Update `RESEND_API_KEY` with new key
   - Update Supabase SMTP settings (if using Resend SMTP):
     - Go to Supabase Dashboard → Authentication → SMTP Settings
     - Update SMTP Password with new Resend API key
   - Redeploy application

3. **Test email delivery:**
   - Send a test enrollment email
   - Check Resend Dashboard for delivery logs

4. **Revoke old key:**
   - Go to Resend Dashboard → API Keys
   - Delete or revoke old key

### Webflow API Token

#### Rotate Webflow API Token

1. **Generate new token in Webflow Dashboard:**
   - Go to Webflow Dashboard → Account Settings → Integrations → API Access
   - Generate new API token
   - Copy the new token

2. **Update environment variable:**
   - Update `WEBFLOW_API_TOKEN` with new token
   - Redeploy application

3. **Test Webflow sync:**
   - Sync a class to Webflow CMS
   - Verify sync works correctly

4. **Revoke old token:**
   - Delete old token in Webflow Dashboard

---

## Production Runbook

### Common Issues and Solutions

#### Issue: Stripe Webhook Not Receiving Events

**Symptoms:**
- Payments process but enrollments not created
- No webhook events in application logs
- Stripe Dashboard shows webhook delivery failures

**Diagnosis Steps:**
1. Check Stripe Dashboard → Developers → Webhooks → Your endpoint
2. Look for failed delivery attempts
3. Check webhook endpoint URL is correct
4. Use Settings page → Test Webhook Endpoint to verify accessibility
5. Check `STRIPE_WEBHOOK_SECRET` is set correctly

**Solutions:**
1. **Webhook URL incorrect:**
   - Update webhook URL in Stripe Dashboard
   - Ensure it matches your production domain
   - Include `/app` base path if applicable

2. **Webhook secret mismatch:**
   - Verify `STRIPE_WEBHOOK_SECRET` matches the secret in Stripe Dashboard
   - Regenerate webhook secret if needed (see Key Rotation section)

3. **Endpoint not accessible:**
   - Check firewall/security settings
   - Verify SSL certificate is valid
   - Check hosting platform allows webhook endpoints

4. **Signature verification failing:**
   - Ensure webhook endpoint receives raw body (not parsed)
   - Verify `stripe-signature` header is present
   - Check webhook secret is correct

**Prevention:**
- Regularly test webhook endpoint using Settings page
- Monitor Stripe Dashboard for webhook delivery issues
- Set up alerts for webhook failures

---

#### Issue: Emails Not Sending

**Symptoms:**
- Enrollment emails not received
- Email logs show failures
- Resend dashboard shows errors

**Diagnosis Steps:**
1. Check Resend Dashboard → Emails for delivery status
2. Check Supabase → Authentication → SMTP Settings
3. Review email logs in admin dashboard
4. Test email using Settings page or test script

**Solutions:**
1. **Resend API key invalid:**
   - Verify `RESEND_API_KEY` is correct
   - Check key hasn't been revoked
   - Rotate key if needed (see Key Rotation section)

2. **SMTP settings incorrect:**
   - Verify Supabase SMTP settings match Resend configuration
   - Check SMTP password is Resend API key
   - Verify sender email matches verified domain

3. **Domain not verified:**
   - Check Resend Dashboard → Domains
   - Verify `midwestea.com` shows as "Verified"
   - Check DNS records (SPF, DKIM, DMARC)

4. **Rate limit exceeded:**
   - Check Resend Dashboard for usage
   - Free tier: 100 emails/day
   - Upgrade plan if needed

**Prevention:**
- Monitor Resend Dashboard regularly
- Set up alerts for email failures
- Track email delivery rates

---

#### Issue: Payment Processed But Enrollment Not Created

**Symptoms:**
- Payment shows as successful in Stripe
- No enrollment record in database
- Student not enrolled in class

**Diagnosis Steps:**
1. Check Stripe Dashboard → Payments for payment status
2. Check Stripe Dashboard → Webhooks for webhook delivery
3. Check application logs for webhook processing errors
4. Check database for partial records (student created but no enrollment)

**Solutions:**
1. **Webhook not received:**
   - See "Stripe Webhook Not Receiving Events" section above

2. **Webhook processing failed:**
   - Check application logs for errors
   - Common issues:
     - Missing class_id in metadata
     - Database connection issues
     - Invalid data format
   - Manually process the payment if needed (see below)

3. **Manual enrollment creation:**
   - If webhook failed, manually create enrollment:
     1. Find payment in Stripe Dashboard
     2. Extract email and class_id from payment metadata
     3. Use admin dashboard to create enrollment manually
     4. Create transaction record if needed

**Prevention:**
- Monitor webhook delivery in Stripe Dashboard
- Set up alerts for webhook failures
- Regularly test checkout flow end-to-end

---

#### Issue: Database Connection Errors

**Symptoms:**
- "Database connection error" messages
- Admin dashboard not loading
- API endpoints returning 500 errors

**Diagnosis Steps:**
1. Check Supabase Dashboard → Project Status
2. Verify environment variables are set correctly
3. Test Supabase connection: `npm run test:supabase`
4. Check Supabase project hasn't been paused

**Solutions:**
1. **Supabase project paused:**
   - Go to Supabase Dashboard
   - Resume project if paused
   - Check billing status

2. **Environment variables incorrect:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Check for typos or extra spaces

3. **Network/firewall issues:**
   - Check hosting platform firewall settings
   - Verify Supabase project allows connections from your hosting IP

4. **Service role key invalid:**
   - Rotate service role key (see Key Rotation section)
   - Update environment variable

**Prevention:**
- Monitor Supabase Dashboard for project status
- Set up Supabase status page alerts
- Regularly test database connection

---

#### Issue: Checkout Session Creation Fails

**Symptoms:**
- "Failed to create checkout session" error
- Users can't proceed to payment
- Stripe API errors in logs

**Diagnosis Steps:**
1. Check Stripe Dashboard → API Logs for errors
2. Verify Stripe keys are production keys (`sk_live_`, `pk_live_`)
3. Check class has `stripe_price_id` configured
4. Verify Stripe product/price exists and is active

**Solutions:**
1. **Stripe keys are test keys:**
   - Switch to production keys (see Key Rotation section)
   - Update `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

2. **Missing stripe_price_id:**
   - Go to admin dashboard → Classes
   - Edit class and add Stripe Price ID
   - Ensure price exists in Stripe Dashboard

3. **Stripe product/price inactive:**
   - Go to Stripe Dashboard → Products
   - Verify product and price are active
   - Reactivate if needed

4. **API rate limiting:**
   - Check Stripe Dashboard for rate limit warnings
   - Implement retry logic if needed
   - Contact Stripe support if persistent

**Prevention:**
- Always use production keys in production
- Verify all classes have stripe_price_id before going live
- Monitor Stripe API usage

---

#### Issue: RLS Policies Blocking Access

**Symptoms:**
- Users can't see their own data
- Admin can't access data
- "Row Level Security policy violation" errors

**Diagnosis Steps:**
1. Check Supabase Dashboard → Database → Policies
2. Verify RLS is enabled on tables
3. Check user authentication status
4. Review policy definitions

**Solutions:**
1. **RLS policies too restrictive:**
   - Review policy definitions in migration `11_setup_rls_for_all_tables.sql`
   - Adjust policies if needed
   - Test with different user roles

2. **User not authenticated:**
   - Verify user is logged in
   - Check session token is valid
   - Re-authenticate if needed

3. **Service role not working:**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set
   - Service role bypasses RLS - use for admin operations

**Prevention:**
- Test RLS policies thoroughly before production
- Document policy behavior
- Monitor for RLS-related errors

---

### Emergency Contacts

**Stripe Support:**
- Dashboard: https://dashboard.stripe.com/support
- Status Page: https://status.stripe.com

**Supabase Support:**
- Dashboard: https://supabase.com/dashboard/support
- Status Page: https://status.supabase.com
- Discord: https://discord.supabase.com

**Resend Support:**
- Dashboard: https://resend.com
- Email: support@resend.com
- Status Page: https://status.resend.com

**Webflow Support:**
- Dashboard: https://webflow.com/dashboard
- Help Center: https://university.webflow.com

---

### Monitoring Checklist

**Daily:**
- [ ] Check Stripe Dashboard for failed payments
- [ ] Check Resend Dashboard for email delivery issues
- [ ] Review error logs for critical errors

**Weekly:**
- [ ] Review webhook delivery success rate
- [ ] Check email delivery metrics
- [ ] Review database performance
- [ ] Check for failed enrollments

**Monthly:**
- [ ] Review API usage and rate limits
- [ ] Audit environment variables
- [ ] Review security logs
- [ ] Update documentation if needed

---

### Backup and Recovery

#### Database Backups

**Automatic Backups:**
- Supabase automatically creates daily backups
- Backups retained for 7 days (check your plan)

**Manual Backup:**
1. Go to Supabase Dashboard → Database → Backups
2. Click "Create backup"
3. Download backup file

**Restore from Backup:**
1. Go to Supabase Dashboard → Database → Backups
2. Select backup point
3. Click "Restore"
4. ⚠️ **Warning:** This will overwrite current database

#### Code Backups

**Git Repository:**
- All code is version controlled in Git
- Use `git log` to find previous versions
- Use `git revert` to rollback changes

---

### Quick Reference Commands

**Test Supabase Connection:**
```bash
npm run test:supabase
```

**Apply Database Migrations:**
```bash
npm run apply-migrations
```

**Test Resend API Key:**
```bash
npm run test-resend-key
```

**Test Email Templates:**
```bash
npm run test-email-templates
```

**List Database Tables:**
```bash
npm run list-tables
```

---

## Document History

- **2025-01-29:** Initial production documentation created
  - Added production URLs and endpoints
  - Added rollback procedures
  - Added key rotation procedures
  - Added production runbook with common issues

---

## Notes

- Keep this document updated as the system evolves
- Review and update quarterly
- Share with team members who need production access
- Store securely - contains sensitive information

