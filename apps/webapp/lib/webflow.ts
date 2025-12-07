import { WebflowClient } from 'webflow-api';
import type { Class } from './classes';

export interface WebflowConfig {
  siteId: string;
  collectionId: string;
  apiToken: string;
}

/**
 * Map Supabase class data to Webflow CMS field format
 */
function mapClassToWebflowFields(classData: Class, isProgram: boolean = false): Record<string, any> {
  // Webflow requires 'name' and 'slug' fields
  const className = classData.class_name || classData.class_id || 'Untitled Class';
  const slug = (classData.class_id || classData.class_name || 'untitled-class')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Build field data based on actual Webflow collection schema
  // For Programs collection: "Course Code" → slug is "program-code"
  // For Classes collection: "Course Code" → slug might be "course-code" (need to verify)
  const fieldData: Record<string, any> = {
    name: className, // "Class Name" field slug is "name"
    slug: slug,     // "Slug" field slug is "slug"
  };

  // Map fields based on actual Webflow slugs
  // Course Code: "program-code" for programs, "course-code" for courses (assumed)
  if (classData.course_code) {
    fieldData[isProgram ? 'program-code' : 'course-code'] = classData.course_code;
  }
  
  if (classData.class_id) fieldData['class-id'] = classData.class_id;
  if (classData.enrollment_start) fieldData['enrollment-start'] = classData.enrollment_start;
  if (classData.enrollment_close) fieldData['enrollment-close'] = classData.enrollment_close;
  if (classData.class_start_date) fieldData['class-start-date'] = classData.class_start_date;
  if (classData.class_close_date) fieldData['class-close-date'] = classData.class_close_date;
  if (classData.location) fieldData['location'] = classData.location;
  
  // Is Online: Switch field - send boolean
  fieldData['is-online'] = classData.is_online || false;
  
  if (classData.product_id) fieldData['product-id'] = classData.product_id;
  if (classData.length_of_class) fieldData['length-of-class'] = classData.length_of_class;
  if (classData.certification_length !== null && classData.certification_length !== undefined) {
    fieldData['certification-length'] = classData.certification_length;
  }
  if (classData.graduation_rate !== null && classData.graduation_rate !== undefined) {
    fieldData['graduation-rate'] = classData.graduation_rate;
  }
  if (classData.registration_limit !== null && classData.registration_limit !== undefined) {
    fieldData['registration-limit'] = classData.registration_limit.toString();
  }
  if (classData.price !== null && classData.price !== undefined) {
    fieldData['price'] = (classData.price / 100).toFixed(2);
  }
  if (classData.registration_fee !== null && classData.registration_fee !== undefined) {
    fieldData['registration-fee'] = (classData.registration_fee / 100).toFixed(2);
  }

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

    const item = await webflow.collections.items.createItem(config.collectionId, {
      isDraft: true, // Create as draft (requires manual publishing)
      fieldData: webflowFields as any, // Type assertion needed due to dynamic field names
    });

    console.log('[Webflow] Item created successfully, ID:', item.id);
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
  classData: Class | Partial<Class>
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
      Object.assign(webflowFields, mapClassToWebflowFields(fullClass));
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
      if (partial.is_online !== undefined) webflowFields['is-online'] = partial.is_online ? 'Yes' : 'No';
      if (partial.product_id !== undefined) webflowFields['product-id'] = partial.product_id || '';
      if (partial.length_of_class !== undefined) webflowFields['length-of-class'] = partial.length_of_class || '';
      if (partial.certification_length !== undefined) webflowFields['certification-length'] = partial.certification_length?.toString() || '';
      if (partial.graduation_rate !== undefined) webflowFields['graduation-rate'] = partial.graduation_rate?.toString() || '';
      if (partial.registration_limit !== undefined) webflowFields['registration-limit'] = partial.registration_limit?.toString() || '';
      if (partial.price !== undefined) webflowFields['price'] = partial.price ? (partial.price / 100).toFixed(2) : '';
      if (partial.registration_fee !== undefined) webflowFields['registration-fee'] = partial.registration_fee ? (partial.registration_fee / 100).toFixed(2) : '';
    }

    // Only update if we have fields to update
    if (Object.keys(webflowFields).length === 0) {
      return { success: true, error: null }; // Nothing to update
    }

    // Use updateItem for a single item update
    await webflow.collections.items.updateItem(config.collectionId, webflowItemId, {
      fieldData: webflowFields,
    });

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating Webflow item:', error);
    return { success: false, error: error.message || 'Failed to update Webflow item' };
  }
}

/**
 * Get Webflow configuration based on program type
 */
export function getWebflowConfig(programType: string | null): WebflowConfig | null {
  const apiToken = process.env.WEBFLOW_API_TOKEN;
  const siteId = process.env.WEBFLOW_SITE_ID;
  
  if (!apiToken || !siteId) {
    console.error('[Webflow] Missing Webflow API configuration');
    console.error('[Webflow] WEBFLOW_API_TOKEN:', apiToken ? 'SET' : 'MISSING');
    console.error('[Webflow] WEBFLOW_SITE_ID:', siteId ? 'SET' : 'MISSING');
    return null;
  }

  let collectionId: string | undefined;
  const expectedVarName = programType === 'program' 
    ? 'WEBFLOW_PROGRAMS_COLLECTION_ID' 
    : 'WEBFLOW_CLASSES_COLLECTION_ID';
  
  if (programType === 'program') {
    collectionId = process.env.WEBFLOW_PROGRAMS_COLLECTION_ID;
  } else {
    // program_type === 'course' or null
    collectionId = process.env.WEBFLOW_COURSES_COLLECTION_ID;
  }

  if (!collectionId) {
    console.error('[Webflow] Missing Webflow collection ID for program type:', programType);
    console.error('[Webflow] Expected environment variable:', expectedVarName);
    console.error('[Webflow] WEBFLOW_PROGRAMS_COLLECTION_ID:', process.env.WEBFLOW_PROGRAMS_COLLECTION_ID ? 'SET' : 'MISSING');
    console.error('[Webflow] WEBFLOW_COURSES_COLLECTION_ID:', process.env.WEBFLOW_COURSES_COLLECTION_ID ? 'SET' : 'MISSING');
    return null;
  }

  return {
    siteId,
    collectionId,
    apiToken,
  };
}

