/**
 * Script to check the "Classes" collection fields and their option values
 * Run with: npx tsx apps/webapp/scripts/check-classes-collection-fields.ts
 */

import { WebflowClient } from 'webflow-api';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const COLLECTION_ID = process.env.WEBFLOW_CLASSES_COLLECTION_ID;

async function checkCollectionFields() {
  const apiToken = process.env.WEBFLOW_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ WEBFLOW_API_TOKEN not found in environment variables');
    process.exit(1);
  }

  if (!COLLECTION_ID) {
    console.error('❌ WEBFLOW_CLASSES_COLLECTION_ID not found in environment variables');
    process.exit(1);
  }

  console.log('🔍 Fetching "Classes" collection fields...\n');
  console.log('Collection ID:', COLLECTION_ID);
  console.log('');

  try {
    const webflow = new WebflowClient({ accessToken: apiToken });

    // Get collection details (includes fields)
    const collection = await webflow.collections.get(COLLECTION_ID);

    console.log('✅ Collection retrieved:\n');
    console.log('Collection Name:', collection.displayName || 'N/A');
    console.log('Collection Slug:', collection.slug || 'N/A');
    console.log('Collection ID:', collection.id || 'N/A');
    console.log('\n--- Field Details ---\n');

    if (collection.fields && collection.fields.length > 0) {
      console.log(`Total fields: ${collection.fields.length}\n`);
      
      // Find programming-type field
      const programmingTypeField = collection.fields.find((field: any) => 
        field.slug === 'programming-type' || field.displayName?.toLowerCase().includes('programming type')
      );
      
      if (programmingTypeField) {
        console.log('🎯 Found programming-type field:');
        console.log('   Display Name:', programmingTypeField.displayName);
        console.log('   Slug:', programmingTypeField.slug);
        console.log('   Type:', programmingTypeField.type);
        console.log('   Validations:', JSON.stringify(programmingTypeField.validations, null, 2));
        
        if (programmingTypeField.validations?.options) {
          console.log('\n   Available Options:');
          programmingTypeField.validations.options.forEach((option: any, index: number) => {
            console.log(`   ${index + 1}. ID: "${option.id}" | Display: "${option.displayName}"`);
          });
        }
        console.log('');
      } else {
        console.log('⚠️  programming-type field not found\n');
      }
      
      // Find programming-offering field
      const programmingOfferingField = collection.fields.find((field: any) => 
        field.slug === 'programming-offering' || field.displayName?.toLowerCase().includes('programming offering')
      );
      
      if (programmingOfferingField) {
        console.log('🎯 Found programming-offering field:');
        console.log('   Display Name:', programmingOfferingField.displayName);
        console.log('   Slug:', programmingOfferingField.slug);
        console.log('   Type:', programmingOfferingField.type);
        console.log('   Validations:', JSON.stringify(programmingOfferingField.validations, null, 2));
        
        if (programmingOfferingField.validations?.options) {
          console.log('\n   Available Options:');
          programmingOfferingField.validations.options.forEach((option: any, index: number) => {
            console.log(`   ${index + 1}. ID: "${option.id}" | Display: "${option.displayName}"`);
          });
        }
        console.log('');
      } else {
        console.log('⚠️  programming-offering field not found\n');
      }
      
      // Show all fields for reference
      console.log('\n--- All Fields ---\n');
      collection.fields.forEach((field: any, index: number) => {
        console.log(`${index + 1}. "${field.displayName || field.name || 'N/A'}"`);
        console.log(`   Slug: "${field.slug || field.id || 'N/A'}"`);
        console.log(`   Type: ${field.type || 'N/A'}`);
        if (field.type === 'Option' && field.validations?.options) {
          console.log(`   Options: ${field.validations.options.map((o: any) => `"${o.id}"`).join(', ')}`);
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

checkCollectionFields();

