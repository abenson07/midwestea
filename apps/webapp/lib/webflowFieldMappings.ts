/**
 * Field mapping configuration for Webflow class selector
 * Maps class data fields to Webflow page element selectors and attributes
 * 
 * This can be customized per page or globally
 */
export interface FieldMapping {
  selector: string;
  attribute: 'textContent' | 'innerHTML' | 'value' | `data-${string}`;
  formatter?: (value: any) => string;
}

export interface WebflowFieldMappings {
  [fieldName: string]: FieldMapping;
}

/**
 * Default field mappings for class data to page elements
 */
export const DEFAULT_FIELD_MAPPINGS: WebflowFieldMappings = {
  classId: {
    selector: '[data-class-id]',
    attribute: 'textContent',
  },
  price: {
    selector: '[data-price]',
    attribute: 'textContent',
    formatter: (cents: number) => cents ? `$${(cents / 100).toFixed(2)}` : '$0.00',
  },
  registrationFee: {
    selector: '[data-registration-fee]',
    attribute: 'textContent',
    formatter: (cents: number) => cents ? `$${(cents / 100).toFixed(2)}` : '$0.00',
  },
  enrollmentStart: {
    selector: '[data-enrollment-start]',
    attribute: 'textContent',
    formatter: (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
  },
  enrollmentClose: {
    selector: '[data-enrollment-close]',
    attribute: 'textContent',
    formatter: (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
  },
  classStartDate: {
    selector: '[data-class-start]',
    attribute: 'textContent',
    formatter: (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
  },
  classCloseDate: {
    selector: '[data-class-close]',
    attribute: 'textContent',
    formatter: (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
  },
  location: {
    selector: '[data-location]',
    attribute: 'textContent',
  },
  isOnline: {
    selector: '[data-is-online]',
    attribute: 'textContent',
    formatter: (value: boolean) => value ? 'Yes' : 'No',
  },
  lengthOfClass: {
    selector: '[data-length]',
    attribute: 'textContent',
  },
  certificationLength: {
    selector: '[data-certification-length]',
    attribute: 'textContent',
    formatter: (value: number) => value ? value.toString() : 'N/A',
  },
  graduationRate: {
    selector: '[data-graduation-rate]',
    attribute: 'textContent',
    formatter: (value: number) => value ? `${(value / 100).toFixed(2)}%` : 'N/A',
  },
  registrationLimit: {
    selector: '[data-registration-limit]',
    attribute: 'textContent',
    formatter: (value: number) => value ? value.toString() : 'N/A',
  },
  purchaseButton: {
    selector: '[data-purchase-button]',
    attribute: 'data-class-code',
  },
};

/**
 * Get custom field mappings for a specific page/slug
 * Can be extended to return different mappings per course
 */
export function getFieldMappingsForSlug(slug: string): WebflowFieldMappings {
  // For now, return default mappings
  // Can be customized per slug in the future
  return DEFAULT_FIELD_MAPPINGS;
}


