import { WebflowClient } from 'webflow-api';
import type { Class } from './classes';

export interface WebflowConfig {
  siteId: string;
  collectionId: string;
  apiToken: string;
}

/**
 * Webflow option IDs for programming-type field
 * These IDs are from the "Classes" collection in Webflow
 */
const PROGRAMMING_TYPE_OPTIONS = {
  program: '8f23647a3279dcd1c52615d67ed7c09d', // "Program"
  course: 'cf6ac20db4b5c1fadcccc2c9aa7b197a',  // "Course"
} as const;

/**
 * Webflow option IDs for programming-offering field
 * These IDs are from the "Classes" collection in Webflow
 */
const PROGRAMMING_OFFERING_OPTIONS: Record<string, string> = {
  'In Person Only': '159920eac500cde3efad27f4d164afa1',
  'In Person + Homework': 'feb38d5ad9ed5841a505405ba760613c',
  'Hybrid': '4cf8fda6d5f5c376f5c872cb20afdb55',
  'Online Only': 'd9fc898f661c2213b2ca5a3b1aff0411',
  'Online + Skills Training': '8c0a65e251fd363e459edca744cc570a',
} as const;

/**
 * Format price/registration fee for Webflow:
 * - Convert cents to dollars with 2 decimal places
 * - Remove .00 if it's a whole dollar amount
 * - Add comma separators for numbers > 999
 * Examples: 880000 → "8,800", 880050 → "8,800.50", 100 → "1"
 */
function formatPriceForWebflow(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return '';
  }
  
  // Convert cents to dollars
  const dollars = cents / 100;
  
  // Format with 2 decimal places
  let formatted = dollars.toFixed(2);
  
  // Remove .00 if it's a whole dollar amount
  if (formatted.endsWith('.00')) {
    formatted = formatted.slice(0, -3);
  }
  
  // Add comma separators for numbers > 999
  // Split by decimal point to handle both whole numbers and decimals
  const parts = formatted.split('.');
  const wholePart = parts[0];
  
  // Add commas to whole number part if > 999
  if (parseInt(wholePart) > 999) {
    const formattedWhole = parseInt(wholePart).toLocaleString('en-US');
    formatted = parts.length > 1 ? `${formattedWhole}.${parts[1]}` : formattedWhole;
  }
  
  return formatted;
}

/**
 * Map Supabase class data to Webflow CMS field format
 * Always includes all fields, even when NULL, so Webflow can clear them on sync
 */
function mapClassToWebflowFields(classData: Class, isProgram: boolean = false): Record<string, any> {
  // Webflow requires 'name' and 'slug' fields
  const className = classData.class_name || classData.class_id || 'Untitled Class';
  const slug = (classData.class_id || classData.class_name || 'untitled-class')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Build field data - always include fields, even when NULL, so Webflow can clear them
  const fieldData: Record<string, any> = {
    name: className,
    slug: slug,
  };

  // Always include course-code (empty string if NULL)
  fieldData['course-code'] = classData.course_code || '';
  
  // Add programming-type field (program or course) - use Webflow option IDs
  fieldData['programming-type'] = isProgram ? PROGRAMMING_TYPE_OPTIONS.program : PROGRAMMING_TYPE_OPTIONS.course;
  
  // Add programming-offering field - use Webflow option IDs, empty string if NULL
  if (classData.programming_offering) {
    const programmingOfferingOptionId = PROGRAMMING_OFFERING_OPTIONS[classData.programming_offering];
    if (programmingOfferingOptionId) {
      fieldData['programming-offering'] = programmingOfferingOptionId;
    } else {
      // Log warning if we have a value but no mapping (shouldn't happen, but helps debug)
      console.warn(`[Webflow] No option ID mapping found for programming_offering: "${classData.programming_offering}"`);
      fieldData['programming-offering'] = '';
    }
  } else {
    fieldData['programming-offering'] = '';
  }
  
  // Always include all fields - set to empty string if NULL to clear in Webflow
  fieldData['class-id'] = classData.class_id || '';
  fieldData['enrollment-start'] = classData.enrollment_start || '';
  fieldData['enrollment-close'] = classData.enrollment_close || '';
  fieldData['class-start-date'] = classData.class_start_date || '';
  fieldData['class-close-date'] = classData.class_close_date || '';
  fieldData['location'] = classData.location || '';
  
  // Is Online: Switch field - send boolean (defaults to false)
  fieldData['is-online'] = classData.is_online || false;
  
  fieldData['product-id'] = classData.product_id || '';
  fieldData['length-of-class'] = classData.length_of_class || '';
  
  // Numeric fields - convert to string, empty string if NULL
  fieldData['certification-length'] = classData.certification_length !== null && classData.certification_length !== undefined 
    ? classData.certification_length.toString() 
    : '';
  fieldData['registration-limit'] = classData.registration_limit !== null && classData.registration_limit !== undefined 
    ? classData.registration_limit.toString() 
    : '';
  
  // Price fields - format with helper function (handles cents to dollars, removes .00, adds commas)
  fieldData['price'] = formatPriceForWebflow(classData.price);
  fieldData['registration-fee'] = formatPriceForWebflow(classData.registration_fee);
  
  // Image and link fields - empty string if NULL
  fieldData['class-image'] = classData.class_image || '';
  fieldData['class-page'] = classData.wf_class_link || '';

  return fieldData;
}

/**
 * Create a Webflow collection item for a class
 */
export async function createWebflowClassItem(
  config: WebflowConfig,
  classData: Class,
  isProgram: boolean = false
): Promise<{ webflowItemId: string | null; error: string | null }> {
  try {
    console.log('[Webflow] Creating item in collection:', config.collectionId);
    const webflow = new WebflowClient({ 
      accessToken: config.apiToken 
    });
    
    const webflowFields = mapClassToWebflowFields(classData, isProgram);
    console.log('[Webflow] Mapped fields:', Object.keys(webflowFields));

    // Try createItemLive first (publishes immediately), fall back to createItem + publishItem if not available
    let item;
    try {
      // Use createItemLive to create and publish immediately (bypasses publish queue)
      item = await webflow.collections.items.createItemLive(config.collectionId, {
        isDraft: false,
        fieldData: webflowFields as any, // Type assertion needed due to dynamic field names
      });
      console.log('[Webflow] Item created and published immediately via createItemLive, ID:', item.id);
    } catch (liveError: any) {
      // If createItemLive fails (e.g., 404 - endpoint not available), fall back to createItem + publishItem
      if (liveError.statusCode === 404 || liveError.message?.includes('not found')) {
        console.log('[Webflow] createItemLive not available, falling back to createItem + publishItem');
        item = await webflow.collections.items.createItem(config.collectionId, {
          isDraft: false,
          fieldData: webflowFields as any,
        });
        console.log('[Webflow] Item created, ID:', item.id);
        
        // Publish immediately after creation
        if (item.id) {
          try {
            await webflow.collections.items.publishItem(config.collectionId, {
              itemIds: [item.id],
            });
            console.log('[Webflow] Item published immediately via publishItem, ID:', item.id);
          } catch (publishError: any) {
            console.error('[Webflow] Error publishing item:', publishError);
            console.warn('[Webflow] Item created but publish failed. Item ID:', item.id);
          }
        }
      } else {
        // Re-throw if it's a different error
        throw liveError;
      }
    }

    return { webflowItemId: item.id || null, error: null };
  } catch (error: any) {
    console.error('[Webflow] Error creating item:', error);
    console.error('[Webflow] Error message:', error.message);
    console.error('[Webflow] Error details:', error);
    if (error.response) {
      console.error('[Webflow] Error response:', error.response);
    }
    return { webflowItemId: null, error: error.message || 'Failed to create Webflow item' };
  }
}

/**
 * Update an existing Webflow collection item for a class
 * Accepts either full Class object or partial Class data
 */
export async function updateWebflowClassItem(
  config: WebflowConfig,
  webflowItemId: string,
  classData: Class | Partial<Class>,
  isProgram: boolean = false
): Promise<{ success: boolean; error: string | null }> {
  try {
    const webflow = new WebflowClient({ 
      accessToken: config.apiToken 
    });
    
    // If we have a full Class object, map all fields
    // Otherwise, only map provided fields
    const webflowFields: Record<string, string> = {};
    
    // Check if we have a full class object (has id property and other required fields)
    const isFullClass = 'id' in classData && 'class_name' in classData;
    
    if (isFullClass) {
      // Use the full mapping function for complete class data
      const fullClass = classData as Class;
      Object.assign(webflowFields, mapClassToWebflowFields(fullClass, isProgram));
    } else {
      // Partial update - only include provided fields
      const partial = classData as Partial<Class>;
      if (partial.class_name !== undefined) webflowFields['class-name'] = partial.class_name || '';
      if (partial.course_code !== undefined) webflowFields['course-code'] = partial.course_code || '';
      if (partial.class_id !== undefined) webflowFields['class-id'] = partial.class_id || '';
      if (partial.enrollment_start !== undefined) webflowFields['enrollment-start'] = partial.enrollment_start || '';
      if (partial.enrollment_close !== undefined) webflowFields['enrollment-close'] = partial.enrollment_close || '';
      if (partial.class_start_date !== undefined) webflowFields['class-start-date'] = partial.class_start_date || '';
      if (partial.class_close_date !== undefined) webflowFields['class-close-date'] = partial.class_close_date || '';
      if (partial.location !== undefined) webflowFields['location'] = partial.location || '';
      if (partial.is_online !== undefined) webflowFields['is-online'] = partial.is_online || false;
      if (partial.product_id !== undefined) webflowFields['product-id'] = partial.product_id || '';
      if (partial.length_of_class !== undefined) webflowFields['length-of-class'] = partial.length_of_class || '';
      if (partial.certification_length !== undefined) webflowFields['certification-length'] = partial.certification_length?.toString() || '';
      if (partial.registration_limit !== undefined) webflowFields['registration-limit'] = partial.registration_limit?.toString() || '';
      if (partial.price !== undefined) webflowFields['price'] = formatPriceForWebflow(partial.price);
      if (partial.registration_fee !== undefined) webflowFields['registration-fee'] = formatPriceForWebflow(partial.registration_fee);
      if (partial.class_image !== undefined) webflowFields['class-image'] = partial.class_image || '';
      if (partial.wf_class_link !== undefined) webflowFields['class-page'] = partial.wf_class_link || '';
      // Add new fields for unified collection - use Webflow option IDs
      if (partial.programming_offering !== undefined) {
        const programmingOfferingOptionId = partial.programming_offering 
          ? PROGRAMMING_OFFERING_OPTIONS[partial.programming_offering] 
          : null;
        // Always set the field, even if NULL, to clear it in Webflow
        webflowFields['programming-offering'] = programmingOfferingOptionId || '';
      }
      // Always include programming-type to ensure it's set correctly (derived from isProgram parameter)
      webflowFields['programming-type'] = isProgram ? PROGRAMMING_TYPE_OPTIONS.program : PROGRAMMING_TYPE_OPTIONS.course;
    }

    // Only update if we have fields to update
    if (Object.keys(webflowFields).length === 0) {
      return { success: true, error: null }; // Nothing to update
    }

    // Try updateItemLive first (publishes immediately), fall back to updateItem + publishItem if not available
    try {
      // Use updateItemLive to update and publish immediately (bypasses publish queue)
      await webflow.collections.items.updateItemLive(config.collectionId, webflowItemId, {
        fieldData: webflowFields,
      });
      console.log('[Webflow] Item updated and published immediately via updateItemLive');
      return { success: true, error: null };
    } catch (liveError: any) {
      // If updateItemLive fails (e.g., 404 - endpoint not available), fall back to updateItem + publishItem
      if (liveError.statusCode === 404 || liveError.message?.includes('not found')) {
        console.log('[Webflow] updateItemLive not available, falling back to updateItem + publishItem');
        await webflow.collections.items.updateItem(config.collectionId, webflowItemId, {
          fieldData: webflowFields,
        });
        
        // Publish immediately after update
        try {
          await webflow.collections.items.publishItem(config.collectionId, {
            itemIds: [webflowItemId],
          });
          console.log('[Webflow] Item updated and published immediately via publishItem');
        } catch (publishError: any) {
          console.error('[Webflow] Error publishing item:', publishError);
          // Don't fail the whole operation if publish fails - item is still updated
          console.warn('[Webflow] Item updated but publish failed');
        }
        
        return { success: true, error: null };
      } else {
        // Re-throw if it's a different error
        throw liveError;
      }
    }
  } catch (error: any) {
    console.error('Error updating Webflow item:', error);
    return { success: false, error: error.message || 'Failed to update Webflow item' };
  }
}

/**
 * Get Webflow configuration - always returns unified "Classes" collection
 */
export function getWebflowConfig(programType: string | null): WebflowConfig | null {
  const apiToken = process.env.WEBFLOW_API_TOKEN;
  const siteId = process.env.WEBFLOW_SITE_ID;
  const collectionId = process.env.WEBFLOW_CLASSES_COLLECTION_ID;
  
  if (!apiToken || !siteId) {
    console.error('[Webflow] Missing Webflow API configuration');
    console.error('[Webflow] WEBFLOW_API_TOKEN:', apiToken ? 'SET' : 'MISSING');
    console.error('[Webflow] WEBFLOW_SITE_ID:', siteId ? 'SET' : 'MISSING');
    return null;
  }

  if (!collectionId) {
    console.error('[Webflow] Missing Webflow collection ID');
    console.error('[Webflow] Expected environment variable: WEBFLOW_CLASSES_COLLECTION_ID');
    console.error('[Webflow] WEBFLOW_CLASSES_COLLECTION_ID:', collectionId ? 'SET' : 'MISSING');
    return null;
  }

  return {
    siteId,
    collectionId,
    apiToken,
  };
}

/**
 * Delete a Webflow collection item for a class
 */
export async function deleteWebflowClassItem(
  config: WebflowConfig,
  webflowItemId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const webflow = new WebflowClient({ 
      accessToken: config.apiToken 
    });
    
    await webflow.collections.items.deleteItem(config.collectionId, webflowItemId);

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting Webflow item:', error);
    return { success: false, error: error.message || 'Failed to delete Webflow item' };
  }
}

