# Resend SMTP Configuration Guide

This document outlines the complete setup process for configuring Resend as the SMTP provider for Supabase Auth in the MidwestEA platform.

## Overview

Resend is configured as the SMTP service provider for sending authentication emails (OTP, password reset, magic links) through Supabase Auth. This provides reliable email delivery and better control over email communications.

## Prerequisites

- Resend account (https://resend.com)
- Supabase project with Auth enabled
- Domain ownership (midwestea.com) for email sending

## Configuration Steps

### 1. Resend Account Setup

1. **Create Resend Account**
   - Navigate to https://resend.com
   - Sign up for an account
   - Complete email verification

2. **Verify Domain**
   - In Resend dashboard, navigate to **Domains** section
   - Click **Add Domain**
   - Enter `midwestea.com`
   - Add the required DNS records to your domain:
     - **SPF Record**: `v=spf1 include:_spf.resend.com ~all`
     - **DKIM Record**: Provided by Resend (unique per domain)
     - **DMARC Record**: `v=DMARC1; p=none; rua=mailto:dmarc@midwestea.com`
   - Wait for domain verification (usually 5-15 minutes)
   - Verify status shows as "Verified" in dashboard

### 2. Generate API Key

1. Navigate to **API Keys** section in Resend dashboard
2. Click **Create API Key**
3. Provide descriptive name: `MidwestEA-Supabase-Auth`
4. Select appropriate permissions (email sending)
5. **Important**: Copy the API key immediately (starts with `re_`)
6. Store securely - it cannot be viewed again after creation

### 3. Configure Supabase SMTP Settings

1. Log into Supabase project dashboard
2. Navigate to **Project Settings** > **Authentication**
3. Scroll to **SMTP Settings** section
4. Enable **"Custom SMTP"** toggle
5. Configure the following settings:

   | Setting | Value |
   |---------|-------|
   | SMTP Host | `smtp.resend.com` |
   | SMTP Port | `465` |
   | SMTP Username | `resend` |
   | SMTP Password | `[Your Resend API Key]` |
   | Sender Email | `noreply@midwestea.com` |
   | Sender Name | `MidwestEA Support` |

6. Click **Save** to apply configuration

### 4. Environment Variables

Add the following to your `.env.local` file (and production environment):

```bash
# Resend API Key (for programmatic email sending)
RESEND_API_KEY=re_your_api_key_here

# Supabase Configuration (should already exist)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Security Notes:**
- Never commit `.env.local` to version control
- Use different API keys for development and production
- Rotate API keys periodically (every 90 days recommended)

## Testing

### Test API Key Validity

```bash
npm run test-resend-key
```

This script verifies:
- API key format and validity
- Domain verification status
- API connectivity

### Test OTP Email Delivery

```bash
npm run test-otp-email your-email@example.com
```

This script:
- Sends a password reset email (uses OTP)
- Measures delivery time
- Verifies email sending functionality

**Expected Results:**
- Email delivered within 5 seconds
- Sender appears as "MidwestEA Support <noreply@midwestea.com>"
- Email appears in Resend dashboard logs
- Email content is properly formatted

### Manual Testing via Supabase Dashboard

1. Navigate to **Authentication** > **Users**
2. Find or create a test user
3. Click **"..."** menu next to user
4. Select **"Send Magic Link"** or **"Send Password Reset"**
5. Check email inbox (and spam folder)

## Troubleshooting

### Issue: Emails Not Being Delivered

**Symptoms:**
- No email received
- Email delivery timeout errors
- SMTP connection errors

**Solutions:**
1. **Verify API Key**
   ```bash
   npm run test-resend-key
   ```
   - Ensure API key is correct and active
   - Check API key hasn't been revoked

2. **Check Domain Verification**
   - Verify domain shows as "Verified" in Resend dashboard
   - Check DNS records are properly configured
   - Use DNS checker tools to verify SPF/DKIM records

3. **Check Supabase SMTP Configuration**
   - Verify all SMTP settings are correct
   - Ensure "Custom SMTP" is enabled
   - Check sender email matches verified domain

4. **Check Resend Dashboard Logs**
   - Navigate to https://resend.com/emails
   - Review delivery logs for errors
   - Check bounce/complaint rates

5. **Test SMTP Connection**
   - Use email testing tools (Mailtrap, etc.)
   - Verify SMTP credentials work independently

### Issue: Emails Going to Spam

**Symptoms:**
- Emails delivered but in spam folder
- Low deliverability rates

**Solutions:**
1. **Verify DNS Records**
   - Ensure SPF, DKIM, and DMARC records are properly configured
   - Use DNS checker: https://mxtoolbox.com/spf.aspx

2. **Improve Email Content**
   - Use professional, clear email templates
   - Avoid spam trigger words
   - Include proper unsubscribe links (if applicable)

3. **Warm Up Domain**
   - Start with low email volumes
   - Gradually increase sending volume
   - Maintain good sender reputation

4. **Monitor Reputation**
   - Check Resend dashboard for bounce/complaint rates
   - Keep bounce rate under 5%
   - Monitor blacklist status

5. **Request Inbox Placement**
   - Contact Resend support for deliverability assistance
   - Request domain reputation review

### Issue: API Key Authentication Errors

**Symptoms:**
- "Invalid API key" errors
- 401 Unauthorized responses

**Solutions:**
1. **Verify API Key Format**
   - Resend API keys start with `re_`
   - Ensure no extra spaces or characters
   - Copy key directly from Resend dashboard

2. **Check Environment Variables**
   - Verify `RESEND_API_KEY` is set correctly
   - Check for typos in `.env.local`
   - Ensure environment variables are loaded

3. **Test API Key**
   ```bash
   npm run test-resend-key
   ```

4. **Regenerate API Key**
   - If key is compromised, regenerate in Resend dashboard
   - Update all environment variables
   - Revoke old key

### Issue: Rate Limiting

**Symptoms:**
- "Rate limit exceeded" errors
- Emails not sending after many attempts

**Solutions:**
1. **Check Resend Limits**
   - Free tier: 100 emails/day
   - Paid tiers: Higher limits
   - Check current usage in Resend dashboard

2. **Implement Rate Limiting**
   - Add delays between email sends
   - Queue emails for batch sending
   - Monitor sending rates

3. **Upgrade Plan**
   - If needed, upgrade Resend plan
   - Contact Resend support for custom limits

### Issue: SMTP Connection Timeout

**Symptoms:**
- Connection timeout errors
- SMTP server not responding

**Solutions:**
1. **Verify SMTP Settings**
   - Host: `smtp.resend.com`
   - Port: `465` (SSL/TLS)
   - Username: `resend`

2. **Check Network/Firewall**
   - Ensure port 465 is not blocked
   - Check firewall rules
   - Verify network connectivity

3. **Test Connection**
   - Use telnet or SMTP testing tools
   - Verify SMTP server is reachable

## Monitoring and Maintenance

### Regular Checks

1. **Weekly:**
   - Review Resend dashboard for delivery rates
   - Check bounce/complaint rates
   - Monitor API usage

2. **Monthly:**
   - Review email deliverability metrics
   - Check domain reputation
   - Update documentation if needed

3. **Quarterly:**
   - Rotate API keys
   - Review and update DNS records
   - Audit email templates

### Key Metrics to Monitor

- **Delivery Rate**: Should be > 95%
- **Bounce Rate**: Should be < 5%
- **Complaint Rate**: Should be < 0.1%
- **Delivery Time**: Should be < 5 seconds
- **API Usage**: Monitor against plan limits

### Resend Dashboard

Access at: https://resend.com

Key sections:
- **Emails**: View delivery logs and statistics
- **Domains**: Manage verified domains
- **API Keys**: Manage API keys
- **Settings**: Account and billing information

## Rollback Procedure

If you need to revert to Supabase's default email service:

1. Navigate to Supabase Dashboard > Authentication > SMTP Settings
2. Disable **"Custom SMTP"** toggle
3. Save configuration
4. Test email delivery with default service
5. Update environment variables if needed

**Note:** Default Supabase email service has limitations:
- Lower deliverability rates
- Less control over email content
- No detailed delivery logs

## Support Contacts

### Resend Support
- **Email**: support@resend.com
- **Documentation**: https://resend.com/docs
- **Status Page**: https://status.resend.com

### Supabase Support
- **Documentation**: https://supabase.com/docs
- **Discord**: https://discord.supabase.com
- **GitHub**: https://github.com/supabase/supabase

## Related Documentation

- [Resend SMTP Documentation](https://resend.com/docs/send-with-supabase-smtp)
- [Supabase Auth Email Configuration](https://supabase.com/docs/guides/auth/auth-email)
- [Email Deliverability Best Practices](https://resend.com/docs/dashboard/domains/introduction)

## Changelog

- **2026-01-03**: Initial configuration completed
  - Resend account created
  - Domain verified (midwestea.com)
  - Supabase SMTP configured
  - Test scripts created
  - Initial testing completed

## Notes

- OTP emails may initially go to spam - this is normal for new sending domains
- Email deliverability improves over time as domain reputation builds
- Custom email templates (Task 3) will improve deliverability
- Monitor Resend dashboard regularly for delivery metrics





