
const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
const path = require('path');

// Load env vars from apps/admin/.env.local
const envPath = path.resolve(__dirname, '../.env.local');
console.log(`Loading env from: ${envPath}`);
config({ path: envPath });

async function checkEnv() {
    console.log('--- Environment Check ---');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log(`NEXT_PUBLIC_SUPABASE_URL: ${url ? 'Set' : 'Missing'}`);
    if (url) console.log(`URL Value: ${url}`);

    console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${key ? 'Set' : 'Missing'}`);
    if (key) console.log(`Key Length: ${key.length}`);

    if (!url || !key) {
        console.error('❌ Missing required environment variables.');
        return;
    }

    try {
        // Validate URL format
        new URL(url);
        console.log('✅ URL format is valid.');
    } catch (e) {
        console.error('❌ Invalid URL format.');
        return;
    }

    console.log('\n--- Connection Check ---');
    try {
        const supabase = createClient(url, key);
        const { data, error } = await supabase.from('classes').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Connection failed:', error.message);
            console.error('Full error:', error);
        } else {
            console.log('✅ Connection successful!');
            console.log(`Table 'classes' exists and is accessible.`);
        }
    } catch (e) {
        console.error('❌ Unexpected error during connection check:', e.message);
    }
}

checkEnv();
