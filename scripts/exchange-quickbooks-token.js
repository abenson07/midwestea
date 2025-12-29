/**
 * Exchange QuickBooks authorization code for access and refresh tokens
 * 
 * Usage:
 *   node scripts/exchange-quickbooks-token.js <authorization_code> <redirect_uri>
 * 
 * Or set environment variables:
 *   QUICKBOOKS_CLIENT_ID=your_client_id
 *   QUICKBOOKS_CLIENT_SECRET=your_client_secret
 *   node scripts/exchange-quickbooks-token.js <authorization_code> <redirect_uri>
 */

const https = require('https');

// Get arguments
const authCode = process.argv[2];
const redirectUri = process.argv[3] || 'http://localhost:3000/api/quickbooks/oauth/callback';

// Get credentials from environment
const clientId = process.env.QUICKBOOKS_CLIENT_ID;
const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

if (!authCode) {
  console.error('Error: Authorization code is required');
  console.error('Usage: node scripts/exchange-quickbooks-token.js <authorization_code> [redirect_uri]');
  process.exit(1);
}

if (!clientSecret) {
  console.error('Error: Client secret is required');
  console.error('Set QUICKBOOKS_CLIENT_SECRET environment variable');
  process.exit(1);
}

// Create Basic Auth header
const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

// Prepare request data
const postData = new URLSearchParams({
  grant_type: 'authorization_code',
  code: authCode,
  redirect_uri: redirectUri,
}).toString();

// Make request
const options = {
  hostname: 'oauth.platform.intuit.com',
  path: '/oauth2/v1/tokens/bearer',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'Authorization': `Basic ${credentials}`,
    'Content-Length': postData.length,
  },
};

console.log('Exchanging authorization code for tokens...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`Error: HTTP ${res.statusCode}`);
      console.error('Response:', data);
      process.exit(1);
    }

    try {
      const response = JSON.parse(data);
      
      console.log('✅ Successfully obtained tokens!\n');
      console.log('Add these to your .env.local file:\n');
      console.log(`QUICKBOOKS_ACCESS_TOKEN=${response.access_token}`);
      console.log(`QUICKBOOKS_REFRESH_TOKEN=${response.refresh_token}`);
      console.log(`QUICKBOOKS_REALM_ID=9341455971522574`);
      console.log(`QUICKBOOKS_COMPANY_ID=9341455971522574`);
      console.log(`QUICKBOOKS_USE_SANDBOX=true\n`);
      
      if (response.realmId) {
        console.log(`Note: Realm ID from response: ${response.realmId}`);
      }
      
      console.log('\nFull response:');
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Error parsing response:', error);
      console.error('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
  process.exit(1);
});

req.write(postData);
req.end();

