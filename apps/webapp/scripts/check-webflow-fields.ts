/**
 * Script to check Webflow collection field slugs
 * Run with: npx tsx apps/webapp/scripts/check-webflow-fields.ts
 */

import { WebflowClient } from 'webflow-api';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

// Get collection ID from command line argument, env var, or use Programs collection as default
const COLLECTION_ID = process.argv[2] || process.env.WEBFLOW_CLASSES_COLLECTION_ID || process.env.WEBFLOW_PROGRAMS_COLLECTION_ID || '690686fd233a7d85ab261a9c';

async function checkWebflowFields() {
  const apiToken = process.env.WEBFLOW_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ WEBFLOW_API_TOKEN not found in environment variables');
    process.exit(1);
  }

  console.log('🔍 Fetching Webflow collection fields...\n');
  console.log('Collection ID:', COLLECTION_ID);
  console.log('API Token:', apiToken.substring(0, 10) + '...\n');

  try {
    const webflow = new WebflowClient({ accessToken: apiToken });

    // Get collection details (includes fields)
    console.log('Fetching collection details...\n');
    const collection = await webflow.collections.get(COLLECTION_ID);

    console.log('✅ Collection retrieved:\n');
    console.log('Collection Name:', collection.displayName || 'N/A');
    console.log('Collection Slug:', collection.slug || 'N/A');
    console.log('Collection ID:', collection.id || 'N/A');
    console.log('\n--- Field Details ---\n');

    if (collection.fields && collection.fields.length > 0) {
      console.log(`Total fields: ${collection.fields.length}\n`);
      collection.fields.forEach((field: any, index: number) => {
        console.log(`${index + 1}. Display Name: "${field.displayName || field.name || 'N/A'}"`);
        console.log(`   Slug: "${field.slug || field.id || 'N/A'}"`);
        console.log(`   Type: ${field.type || 'N/A'}`);
        console.log(`   Required: ${field.isRequired ? 'Yes' : 'No'}`);
        console.log(`   Editable: ${field.isEditable !== false ? 'Yes' : 'No'}`);
        if (field.helpText) {
          console.log(`   Help Text: ${field.helpText}`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️  No fields found in collection response');
      console.log('\nFull collection response:');
      console.log(JSON.stringify(collection, null, 2));
    }

  } catch (error: any) {
    console.error('❌ Error fetching fields:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', JSON.stringify(error.response.body || error.response.data, null, 2));
    }
    process.exit(1);
  }
}

checkWebflowFields();

