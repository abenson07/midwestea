# QuickBooks OAuth Setup Guide

This guide walks you through setting up OAuth 2.0 authentication with QuickBooks Online for the checkout integration.

## Prerequisites

- QuickBooks Developer Account (https://developer.intuit.com/)
- App registered in QuickBooks Developer Dashboard
- Client ID and Client Secret (already in `.env.local`)

## Step 1: Register Your App in QuickBooks Developer Dashboard

1. Go to https://developer.intuit.com/
2. Sign in with your Intuit account
3. Navigate to **My Apps** → **Create an App**
4. Select **QuickBooks Online** as the product
5. Choose **Sandbox** environment for development
6. Fill in app details:
   - App Name: MidwestEA Checkout
   - Redirect URI: `http://localhost:3000/api/quickbooks/oauth/callback` (for local development)
   - Scopes: Select `com.intuit.quickbooks.accounting`
7. Save your app and note the **Client ID** and **Client Secret**

## Step 2: Set Up Redirect URI

For production, you'll need to add your production redirect URI:
- Production: `https://yourdomain.com/api/quickbooks/oauth/callback`

Update this in your QuickBooks app settings.

## Step 3: Obtain Initial Access Token (Sandbox)

### Option A: Using QuickBooks OAuth Playground (Recommended for Testing)

1. Go to https://developer.intuit.com/app/developer/qbo/docs/get-started
2. Use the OAuth 2.0 Playground to get tokens
3. Follow the authorization flow
4. Copy the **Access Token** and **Refresh Token**

### Option B: Manual OAuth Flow

1. Construct the authorization URL:
   ```
   https://appcenter.intuit.com/connect/oauth2?
     client_id=YOUR_CLIENT_ID&
     scope=com.intuit.quickbooks.accounting&
     redirect_uri=YOUR_REDIRECT_URI&
     response_type=code&
     access_type=offline
   ```

2. Open this URL in your browser and authorize the app
3. You'll be redirected to your redirect URI with a `code` parameter
4. Exchange the code for tokens:
   ```bash
   curl -X POST https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -H "Authorization: Basic BASE64(CLIENT_ID:CLIENT_SECRET)" \
     -d "grant_type=authorization_code&code=YOUR_CODE&redirect_uri=YOUR_REDIRECT_URI"
   ```

5. Save the `access_token` and `refresh_token` from the response

## Step 4: Get Company ID (Realm ID)

1. After authorizing, you'll receive a `realmId` in the OAuth response
2. This is your Company ID (also called Realm ID)
3. For sandbox, this is typically: `9341455971522574` (as provided)

## Step 5: Add Environment Variables

Add the following to your `.env.local` file:

```env
# QuickBooks OAuth Credentials
QUICKBOOKS_CLIENT_ID=your_client_id_here
QUICKBOOKS_CLIENT_SECRET=your_client_secret_here
QUICKBOOKS_COMPANY_ID=9341455971522574
QUICKBOOKS_REALM_ID=9341455971522574
QUICKBOOKS_ACCESS_TOKEN=your_access_token_here
QUICKBOOKS_REFRESH_TOKEN=your_refresh_token_here
QUICKBOOKS_USE_SANDBOX=true
```

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the checkout flow and test creating an invoice

3. Check the console logs for any authentication errors

## Token Refresh

The QuickBooks API client automatically refreshes access tokens when they expire using the refresh token. However, refresh tokens can also expire. If you see authentication errors:

1. Re-run the OAuth flow to get new tokens
2. Update `QUICKBOOKS_ACCESS_TOKEN` and `QUICKBOOKS_REFRESH_TOKEN` in `.env.local`
3. Restart your server

## Production Setup

For production:

1. Create a production app in QuickBooks Developer Dashboard
2. Update redirect URI to your production domain
3. Complete OAuth flow with production app
4. Update environment variables with production credentials
5. Set `QUICKBOOKS_USE_SANDBOX=false` in production

## Troubleshooting

### "Access token expired" errors
- The client automatically refreshes tokens, but if refresh fails, re-run OAuth flow

### "Invalid client" errors
- Verify `QUICKBOOKS_CLIENT_ID` and `QUICKBOOKS_CLIENT_SECRET` are correct
- Ensure you're using the correct environment (sandbox vs production)

### "Company not found" errors
- Verify `QUICKBOOKS_COMPANY_ID` matches your QuickBooks company
- Ensure the access token is for the correct company

### Webhook not receiving events
- Verify webhook URL is accessible from the internet
- Check QuickBooks webhook configuration in Developer Dashboard
- Ensure webhook endpoint is set up at `/api/webhooks/quickbooks`

## Additional Resources

- [QuickBooks API Documentation](https://developer.intuit.com/app/developer/qbo/docs)
- [OAuth 2.0 Guide](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [Sandbox Testing Guide](https://developer.intuit.com/app/developer/qbo/docs/develop/sandboxes)

