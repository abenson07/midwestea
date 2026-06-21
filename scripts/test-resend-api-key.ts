/**
 * Test Resend API Key Validity
 * 
 * Usage:
 *   RESEND_API_KEY=your_key_here npm run test-resend-key
 *   or
 *   npx tsx scripts/test-resend-api-key.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

if (require('fs').existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function testResendApiKey() {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    console.log('\nPlease set RESEND_API_KEY in your .env.local file:');
    console.log('RESEND_API_KEY=re_your_api_key_here');
    process.exit(1);
  }

  console.log('🔍 Testing Resend API key...');
  console.log(`📝 API Key (first 10 chars): ${RESEND_API_KEY.substring(0, 10)}...`);

  try {
    // Test 1: Check API key format
    if (!RESEND_API_KEY.startsWith('re_')) {
      console.warn('⚠️  Warning: Resend API keys typically start with "re_"');
    }

    // Test 2: Make API call to verify key
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key is valid!');
      console.log(`📊 Found ${data.data?.length || 0} verified domain(s)`);
      
      if (data.data && data.data.length > 0) {
        console.log('\nVerified domains:');
        data.data.forEach((domain: any) => {
          console.log(`  - ${domain.name} (${domain.status})`);
        });
      } else {
        console.log('\n⚠️  No verified domains found. You may need to verify your domain first.');
      }
      
      return true;
    } else {
      const error = await response.json();
      console.error('❌ API key validation failed');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${error.message || JSON.stringify(error)}`);
      
      if (response.status === 401) {
        console.error('\n💡 This usually means:');
        console.error('   - API key is invalid or expired');
        console.error('   - API key format is incorrect');
        console.error('   - API key doesn\'t have required permissions');
      }
      
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error testing API key:', error.message);
    console.error('\n💡 Check your internet connection and try again.');
    return false;
  }
}

// Run the test
testResendApiKey()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });





