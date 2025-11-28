
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars from apps/admin/.env.local
config({ path: path.resolve(__dirname, '../apps/admin/.env.local') });

const createSupabaseClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
        throw new Error('Missing Supabase URL or ANON key.');
    }

    return createClient(url, key);
};

async function getClasses() {
    try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from("classes")
            .select("*")
            .order("class_id");

        if (error) {
            return { classes: null, error: error.message };
        }

        return { classes: data, error: null };
    } catch (err: any) {
        return { classes: null, error: err.message || "Failed to fetch classes" };
    }
}

async function test() {
    console.log('Testing getClasses...');
    try {
        const result = await getClasses();
        console.log('Result:', result);
    } catch (error) {
        console.error('Crash:', error);
    }
}

test();
