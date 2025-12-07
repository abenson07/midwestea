import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check Webflow environment variables
 * DO NOT USE IN PRODUCTION - This exposes env var status
 */
export async function GET() {
  return NextResponse.json({
    WEBFLOW_API_TOKEN: process.env.WEBFLOW_API_TOKEN ? 'SET (hidden)' : 'MISSING',
    WEBFLOW_SITE_ID: process.env.WEBFLOW_SITE_ID ? 'SET' : 'MISSING',
    WEBFLOW_CLASSES_COLLECTION_ID: process.env.WEBFLOW_CLASSES_COLLECTION_ID ? 'SET' : 'MISSING',
    WEBFLOW_PROGRAMS_COLLECTION_ID: process.env.WEBFLOW_PROGRAMS_COLLECTION_ID ? 'SET' : 'MISSING',
    // Show first few chars to verify it's the right value (not exposing full value)
    WEBFLOW_CLASSES_COLLECTION_ID_PREVIEW: process.env.WEBFLOW_CLASSES_COLLECTION_ID 
      ? `${process.env.WEBFLOW_CLASSES_COLLECTION_ID.substring(0, 10)}...` 
      : 'MISSING',
    WEBFLOW_PROGRAMS_COLLECTION_ID_PREVIEW: process.env.WEBFLOW_PROGRAMS_COLLECTION_ID 
      ? `${process.env.WEBFLOW_PROGRAMS_COLLECTION_ID.substring(0, 10)}...` 
      : 'MISSING',
  });
}

