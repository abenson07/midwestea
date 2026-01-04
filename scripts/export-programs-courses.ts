/**
 * Export Programs and Courses to CSV
 * 
 * Usage:
 *   npx tsx scripts/export-programs-courses.ts
 * 
 * Make sure you have .env.local set up with:
 *   SUPABASE_URL=your_url
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 */

import dotenv from 'dotenv';
import path from 'path';
import { createSupabaseAdminClient } from '../packages/utils/supabaseClient';
import * as fs from 'fs';

// Load environment variables from .env.local (relative to project root)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

interface Course {
  id: string;
  course_name: string;
  course_code: string | null;
  program_type: string | null;
  length_of_class: string | null;
  certification_length: number | null;
  graduation_rate: number | null;
  registration_limit: number | null;
  price: number | null;
  registration_fee: number | null;
  stripe_product_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  type?: string | null; // Legacy field
}

/**
 * Escape CSV field value
 */
function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCsv(data: any[], headers: string[]): string {
  const rows = data.map(row => {
    return headers.map(header => escapeCsvField(row[header])).join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Format currency from cents to dollars
 */
function formatCurrency(cents: number | null): string {
  if (cents === null) return '';
  return (cents / 100).toFixed(2);
}

/**
 * Format percentage from basis points to percentage
 */
function formatPercentage(basisPoints: number | null): string {
  if (basisPoints === null) return '';
  return (basisPoints / 100).toFixed(2);
}

async function exportProgramsAndCourses() {
  console.log('📊 Exporting Programs and Courses to CSV...\n');

  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error('❌ Missing required environment variables.');
    console.error('Please set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Fetch all programs (where program_type = 'program')
    console.log('🔍 Fetching programs...');
    const { data: programs, error: programsError } = await supabase
      .from('courses')
      .select('*')
      .eq('program_type', 'program')
      .order('course_code');

    if (programsError) {
      throw new Error(`Failed to fetch programs: ${programsError.message}`);
    }

    console.log(`  ✅ Found ${programs?.length || 0} programs\n`);

    // Fetch all courses (where program_type = 'course' or null)
    console.log('🔍 Fetching courses...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .or('program_type.eq.course,program_type.is.null')
      .order('course_code');

    if (coursesError) {
      throw new Error(`Failed to fetch courses: ${coursesError.message}`);
    }

    console.log(`  ✅ Found ${courses?.length || 0} courses\n`);

    // Prepare data for CSV export
    const programsForCsv = (programs || []).map((p: Course) => ({
      id: p.id,
      course_name: p.course_name,
      course_code: p.course_code || '',
      program_type: p.program_type || '',
      length_of_class: p.length_of_class || '',
      certification_length: p.certification_length?.toString() || '',
      graduation_rate: formatPercentage(p.graduation_rate),
      registration_limit: p.registration_limit?.toString() || '',
      price: formatCurrency(p.price),
      registration_fee: formatCurrency(p.registration_fee),
      stripe_product_id: p.stripe_product_id || '',
      created_at: p.created_at || '',
      updated_at: p.updated_at || '',
    }));

    const coursesForCsv = (courses || []).map((c: Course) => ({
      id: c.id,
      course_name: c.course_name,
      course_code: c.course_code || '',
      program_type: c.program_type || '',
      length_of_class: c.length_of_class || '',
      certification_length: c.certification_length?.toString() || '',
      graduation_rate: formatPercentage(c.graduation_rate),
      registration_limit: c.registration_limit?.toString() || '',
      price: formatCurrency(c.price),
      registration_fee: formatCurrency(c.registration_fee),
      stripe_product_id: c.stripe_product_id || '',
      created_at: c.created_at || '',
      updated_at: c.updated_at || '',
    }));

    // Define CSV headers
    const headers = [
      'id',
      'course_name',
      'course_code',
      'program_type',
      'length_of_class',
      'certification_length',
      'graduation_rate',
      'registration_limit',
      'price',
      'registration_fee',
      'stripe_product_id',
      'created_at',
      'updated_at',
    ];

    // Generate CSV content
    const programsCsv = arrayToCsv(programsForCsv, headers);
    const coursesCsv = arrayToCsv(coursesForCsv, headers);

    // Write to files
    const programsPath = path.resolve(__dirname, '../programs.csv');
    const coursesPath = path.resolve(__dirname, '../courses.csv');

    fs.writeFileSync(programsPath, programsCsv, 'utf-8');
    fs.writeFileSync(coursesPath, coursesCsv, 'utf-8');

    console.log('✅ CSV files created successfully!');
    console.log(`  📄 Programs: ${programsPath}`);
    console.log(`  📄 Courses: ${coursesPath}\n`);

    console.log('✨ Export completed successfully!\n');
  } catch (error: any) {
    console.error('\n❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run the export
exportProgramsAndCourses().catch((error) => {
  console.error('\n❌ Export failed:', error.message);
  process.exit(1);
});






