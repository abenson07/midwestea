/**
 * Test OTP Email Delivery via Supabase Auth
 * 
 * This script tests that OTP emails are being sent through Resend SMTP
 * configured in Supabase Auth.
 * 
 * Usage:
 *   npm run test-otp-email <email-address>
 *   or
 *   npx tsx scripts/test-otp-email.ts <email-address>
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

if (require('fs').existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function testOTPEmail(email: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase configuration');
    console.log('\nPlease ensure these environment variables are set:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
    process.exit(1);
  }

  if (!email) {
    console.error('❌ Email address required');
    console.log('\nUsage: npm run test-otp-email <email-address>');
    console.log('Example: npm run test-otp-email test@example.com');
    process.exit(1);
  }

  console.log('🔍 Testing OTP email delivery...');
  console.log(`📧 Target email: ${email}`);
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}\n`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Test 1: Password Reset (Magic Link/OTP)
    console.log('📨 Attempting to send password reset email...');
    const startTime = Date.now();
    
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SUPABASE_URL}/auth/callback`,
    });

    const deliveryTime = Date.now() - startTime;

    if (resetError) {
      console.error('❌ Error sending password reset email:', resetError.message);
      
      // Check if it's a rate limit error
      if (resetError.message.includes('rate limit') || resetError.message.includes('too many')) {
        console.log('\n💡 Rate limit detected. Wait a few minutes and try again.');
        console.log('   Or use a different email address for testing.');
      }
      
      return false;
    }

    console.log('✅ Password reset email sent successfully!');
    console.log(`⏱️  Delivery time: ${deliveryTime}ms (${(deliveryTime / 1000).toFixed(2)} seconds)`);
    
    if (deliveryTime < 5000) {
      console.log('✅ Delivery time is under 5 seconds - excellent!');
    } else {
      console.log('⚠️  Delivery time is over 5 seconds - may need investigation');
    }

    console.log('\n📋 Next steps:');
    console.log('1. Check your email inbox (and spam folder) for the password reset email');
    console.log('2. Verify the sender appears as "MidwestEA Support <noreply@midwestea.com>"');
    console.log('3. Check Resend dashboard (https://resend.com/emails) for delivery logs');
    console.log('4. Verify email content and formatting look correct');
    
    console.log('\n💡 Alternative test methods:');
    console.log('   - Sign up a new user with this email');
    console.log('   - Use Supabase Dashboard > Authentication > Users > Send Magic Link');
    
    return true;
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Get email from command line arguments
const email = process.argv[2];

testOTPEmail(email)
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });





