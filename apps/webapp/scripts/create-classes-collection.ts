/**
 * Script to create a new "Classes" Webflow collection from a template collection
 * and add programming-type and programming-offering select fields
 * 
 * Usage: npx tsx apps/webapp/scripts/create-classes-collection.ts
 */

import { WebflowClient } from 'webflow-api';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const TEMPLATE_COLLECTION_ID = '6934d86048580ea1722fa856';
const SITE_ID = process.env.WEBFLOW_SITE_ID;

// Programming offering enum values from Supabase
const PROGRAMMING_OFFERING_OPTIONS = [
  'Online + Skills Training',
  'Online Only',
  'Hybrid',
  'In Person + Homework',
  'In Person Only',
];

async function createClassesCollection() {
  const apiToken = process.env.WEBFLOW_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ WEBFLOW_API_TOKEN not found in environment variables');
    process.exit(1);
  }

  if (!SITE_ID) {
    console.error('❌ WEBFLOW_SITE_ID not found in environment variables');
    process.exit(1);
  }

  console.log('🔍 Creating new "Classes" collection from template...\n');
  console.log('Template Collection ID:', TEMPLATE_COLLECTION_ID);
  console.log('Site ID:', SITE_ID);
  console.log('API Token:', apiToken.substring(0, 10) + '...\n');

  try {
    const webflow = new WebflowClient({ accessToken: apiToken });

    // Step 1: Get template collection details
    console.log('📋 Step 1: Fetching template collection fields...');
    const templateCollection = await webflow.collections.get(TEMPLATE_COLLECTION_ID);
    
    console.log('✅ Template collection retrieved:');
    console.log('   Name:', templateCollection.displayName || 'N/A');
    console.log('   Slug:', templateCollection.slug || 'N/A');
    console.log('   Fields:', templateCollection.fields?.length || 0);
    console.log('');

    // Step 2: Filter out system fields and prepare field definitions
    const systemFieldSlugs = ['_archived', '_draft', '_cid', '_id'];
    const templateFields = (templateCollection.fields || [])
      .filter((field: any) => {
        const slug = field.slug || field.id;
        return !systemFieldSlugs.includes(slug);
      })
      .map((field: any) => {
        // Map field structure for collection creation
        // Note: Webflow API may require specific field structure
        return {
          displayName: field.displayName || field.name,
          slug: field.slug,
          type: field.type,
          isRequired: field.isRequired || false,
          isEditable: field.isEditable !== false,
          helpText: field.helpText || undefined,
          // Include field-specific properties based on type
          ...(field.type === 'Option' && field.validations?.options ? {
            validations: {
              options: field.validations.options
            }
          } : {}),
          ...(field.type === 'Number' && field.validations ? {
            validations: field.validations
          } : {}),
          ...(field.type === 'Date' && field.validations ? {
            validations: field.validations
          } : {}),
        };
      });

    console.log(`📝 Prepared ${templateFields.length} fields from template (excluding system fields)\n`);

    // Step 3: Create new collection
    console.log('🏗️  Step 2: Creating new "Classes" collection...');
    
    // Note: Webflow API v2 may require fields to be added after collection creation
    // Let's try creating the collection first, then add fields
    const newCollection = await webflow.collections.create(SITE_ID, {
      displayName: 'Classes',
      singularName: 'Class',
      slug: 'classes',
    });

    console.log('✅ Collection created successfully:');
    console.log('   Collection ID:', newCollection.id);
    console.log('   Name:', newCollection.displayName);
    console.log('   Slug:', newCollection.slug);
    console.log('');

    // Step 4: Add template fields to new collection
    console.log('📝 Step 3: Adding fields from template...');
    let fieldsAdded = 0;
    let fieldsSkipped = 0;

    for (const field of templateFields) {
      try {
        // Skip if field already exists (name/slug are typically auto-created)
        if (field.slug === 'name' || field.slug === 'slug') {
          console.log(`   ⏭️  Skipping system field: ${field.displayName} (${field.slug})`);
          fieldsSkipped++;
          continue;
        }

        await webflow.collections.fields.create(newCollection.id, {
          displayName: field.displayName,
          slug: field.slug,
          type: field.type,
          isRequired: field.isRequired,
          isEditable: field.isEditable,
          helpText: field.helpText,
          ...(field.validations ? { validations: field.validations } : {}),
        });
        
        console.log(`   ✅ Added field: ${field.displayName} (${field.slug}, ${field.type})`);
        fieldsAdded++;
      } catch (error: any) {
        // Field might already exist or have validation issues
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`   ⚠️  Field already exists: ${field.displayName} (${field.slug})`);
          fieldsSkipped++;
        } else {
          console.error(`   ❌ Error adding field ${field.displayName}:`, error.message);
          // Continue with other fields
        }
      }
    }

    console.log(`\n✅ Added ${fieldsAdded} fields, skipped ${fieldsSkipped} fields\n`);

    // Step 5: Add programming-type select field
    console.log('📝 Step 4: Adding "programming-type" select field...');
    try {
      await webflow.collections.fields.create(newCollection.id, {
        displayName: 'Programming Type',
        slug: 'programming-type',
        type: 'Option',
        isRequired: false,
        isEditable: true,
        validations: {
          options: [
            { displayName: 'Program', id: 'program' },
            { displayName: 'Course', id: 'course' },
          ],
        },
      });
      console.log('   ✅ Added programming-type field\n');
    } catch (error: any) {
      console.error('   ❌ Error adding programming-type field:', error.message);
      if (error.response) {
        console.error('   Response:', JSON.stringify(error.response.body || error.response.data, null, 2));
      }
    }

    // Step 6: Add programming-offering select field
    console.log('📝 Step 5: Adding "programming-offering" select field...');
    try {
      await webflow.collections.fields.create(newCollection.id, {
        displayName: 'Programming Offering',
        slug: 'programming-offering',
        type: 'Option',
        isRequired: false,
        isEditable: true,
        validations: {
          options: PROGRAMMING_OFFERING_OPTIONS.map((option) => ({
            displayName: option,
            id: option.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          })),
        },
      });
      console.log('   ✅ Added programming-offering field\n');
    } catch (error: any) {
      console.error('   ❌ Error adding programming-offering field:', error.message);
      if (error.response) {
        console.error('   Response:', JSON.stringify(error.response.body || error.response.data, null, 2));
      }
    }

    // Final output
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Collection creation complete!');
    console.log('');
    console.log('📋 Next steps:');
    console.log(`   1. Set environment variable: WEBFLOW_CLASSES_COLLECTION_ID=${newCollection.id}`);
    console.log('   2. Update your code to use the unified collection');
    console.log('   3. Test by creating a new class and syncing to Webflow');
    console.log('');
    console.log(`🔑 Collection ID: ${newCollection.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error: any) {
    console.error('❌ Error creating collection:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', JSON.stringify(error.response.body || error.response.data, null, 2));
    }
    process.exit(1);
  }
}

createClassesCollection();







