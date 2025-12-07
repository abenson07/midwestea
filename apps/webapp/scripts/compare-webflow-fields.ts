/**
 * Script to compare Webflow collection fields with code mapping
 * Run with: npx tsx apps/webapp/scripts/compare-webflow-fields.ts <collection-id>
 */

import { WebflowClient } from 'webflow-api';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const COLLECTION_ID = process.argv[2] || process.env.WEBFLOW_COURSES_COLLECTION_ID;

if (!COLLECTION_ID) {
  console.error('❌ Please provide collection ID as argument or set WEBFLOW_COURSES_COLLECTION_ID');
  console.error('Usage: npx tsx apps/webapp/scripts/compare-webflow-fields.ts <collection-id>');
  process.exit(1);
}

// Fields that the code sends (for courses, isProgram=false)
const CODE_FIELDS = {
  'name': 'Class Name (from class_name or class_id)',
  'slug': 'Slug (auto-generated)',
  'course-code': 'Course Code (from course_code)',
  'class-id': 'Class ID (from class_id)',
  'enrollment-start': 'Enrollment Start (from enrollment_start)',
  'enrollment-close': 'Enrollment Close (from enrollment_close)',
  'class-start-date': 'Class Start Date (from class_start_date)',
  'class-close-date': 'Class Close Date (from class_close_date)',
  'location': 'Location (from location)',
  'is-online': 'Is Online (from is_online, boolean)',
  'product-id': 'Product ID (from product_id)',
  'length-of-class': 'Length of Class (from length_of_class)',
  'certification-length': 'Certification Length (from certification_length)',
  'graduation-rate': 'Graduation Rate (from graduation_rate)',
  'registration-limit': 'Registration Limit (from registration_limit)',
  'price': 'Price (from price, converted from cents)',
  'registration-fee': 'Registration Fee (from registration_fee, converted from cents)',
};

async function compareFields() {
  const apiToken = process.env.WEBFLOW_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ WEBFLOW_API_TOKEN not found in environment variables');
    process.exit(1);
  }

  console.log('🔍 Comparing Webflow collection fields with code mapping...\n');
  console.log('Collection ID:', COLLECTION_ID);
  console.log('');

  try {
    const webflow = new WebflowClient({ accessToken: apiToken });
    const collection = await webflow.collections.get(COLLECTION_ID);

    console.log('✅ Collection:', collection.displayName || 'N/A');
    console.log('');

    if (!collection.fields || collection.fields.length === 0) {
      console.log('⚠️  No fields found in collection');
      return;
    }

    // Build map of Webflow field slugs
    const webflowFields: Record<string, { displayName: string; type: string; required: boolean }> = {};
    collection.fields.forEach((field: any) => {
      const slug = field.slug || field.id;
      webflowFields[slug] = {
        displayName: field.displayName || field.name || 'N/A',
        type: field.type || 'N/A',
        required: field.isRequired || false,
      };
    });

    console.log('--- FIELD COMPARISON ---\n');

    // Check fields that code sends
    console.log('📤 Fields Code Sends:');
    const codeFieldSlugs = Object.keys(CODE_FIELDS);
    const missingInWebflow: string[] = [];
    const foundInWebflow: string[] = [];

    codeFieldSlugs.forEach(slug => {
      if (webflowFields[slug]) {
        foundInWebflow.push(slug);
        console.log(`  ✅ ${slug.padEnd(25)} → "${webflowFields[slug].displayName}" (${webflowFields[slug].type})`);
      } else {
        missingInWebflow.push(slug);
        console.log(`  ❌ ${slug.padEnd(25)} → NOT FOUND in Webflow`);
      }
    });

    console.log('\n📥 Fields in Webflow (not in code):');
    const webflowSlugs = Object.keys(webflowFields);
    const notInCode = webflowSlugs.filter(slug => !codeFieldSlugs.includes(slug));
    
    if (notInCode.length === 0) {
      console.log('  (None - all Webflow fields are mapped)');
    } else {
      notInCode.forEach(slug => {
        console.log(`  ⚠️  ${slug.padEnd(25)} → "${webflowFields[slug].displayName}" (${webflowFields[slug].type})`);
      });
    }

    console.log('\n--- SUMMARY ---\n');
    console.log(`✅ Fields that match: ${foundInWebflow.length}`);
    console.log(`❌ Fields missing in Webflow: ${missingInWebflow.length}`);
    console.log(`⚠️  Fields in Webflow but not in code: ${notInCode.length}`);

    if (missingInWebflow.length > 0) {
      console.log('\n❌ FIELDS THAT NEED TO BE ADDED TO WEBFLOW:');
      missingInWebflow.forEach(slug => {
        console.log(`   - ${slug} (${CODE_FIELDS[slug as keyof typeof CODE_FIELDS]})`);
      });
    }

    if (notInCode.length > 0) {
      console.log('\n⚠️  FIELDS IN WEBFLOW THAT CODE DOESN\'T SEND:');
      notInCode.forEach(slug => {
        console.log(`   - ${slug} → "${webflowFields[slug].displayName}"`);
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.body || error.response.data, null, 2));
    }
    process.exit(1);
  }
}

compareFields();

