/**
 * Webflow Class Selector Script
 * 
 * This script should be embedded in Webflow pages via Custom Code.
 * It queries active classes from Supabase and allows users to select a class,
 * then updates page elements with the selected class data.
 * 
 * Configuration:
 * - Set API_BASE_URL to your Next.js app URL (e.g., 'https://your-domain.com' or '/app' for relative)
 * - Configure field mappings in the FIELD_MAPPINGS object below
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE_URL = '/app'; // Change this to your API base URL
  const FIELD_MAPPINGS = {
    // Map class fields to page element selectors
    // Format: 'fieldName': { selector: 'CSS selector', attribute: 'textContent|innerHTML|data-*|value' }
    'classId': { selector: '[data-class-id]', attribute: 'textContent' },
    'price': { selector: '[data-price]', attribute: 'textContent' },
    'registrationFee': { selector: '[data-registration-fee]', attribute: 'textContent' },
    'enrollmentStart': { selector: '[data-enrollment-start]', attribute: 'textContent' },
    'enrollmentClose': { selector: '[data-enrollment-close]', attribute: 'textContent' },
    'classStartDate': { selector: '[data-class-start]', attribute: 'textContent' },
    'classCloseDate': { selector: '[data-class-close]', attribute: 'textContent' },
    'location': { selector: '[data-location]', attribute: 'textContent' },
    'isOnline': { selector: '[data-is-online]', attribute: 'textContent' },
    'lengthOfClass': { selector: '[data-length]', attribute: 'textContent' },
    'certificationLength': { selector: '[data-certification-length]', attribute: 'textContent' },
    'graduationRate': { selector: '[data-graduation-rate]', attribute: 'textContent' },
    'registrationLimit': { selector: '[data-registration-limit]', attribute: 'textContent' },
    // Purchase button - update class code
    'purchaseButton': { selector: '[data-purchase-button]', attribute: 'data-class-code' },
  };

  /**
   * Extract course slug from URL
   * Assumes URL format like: /course/bls or /bls or ?course=bls
   */
  function getCourseSlugFromURL() {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Try query parameter first
    if (searchParams.get('course')) {
      return searchParams.get('course');
    }
    
    // Try path segments
    const pathParts = path.split('/').filter(p => p);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      // Skip common paths like 'course', 'program', etc.
      if (lastPart && !['course', 'program', 'courses', 'programs'].includes(lastPart.toLowerCase())) {
        return lastPart;
      }
      // Try second to last if last is a common word
      if (pathParts.length > 1) {
        return pathParts[pathParts.length - 2];
      }
    }
    
    // Try data attribute on body
    const bodySlug = document.body.getAttribute('data-course-slug');
    if (bodySlug) {
      return bodySlug;
    }
    
    return null;
  }

  /**
   * Fetch active classes from API
   */
  async function fetchActiveClasses(slug) {
    try {
      const url = `${API_BASE_URL}/api/classes/active?slug=${encodeURIComponent(slug)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.classes || [];
    } catch (error) {
      console.error('Error fetching active classes:', error);
      return [];
    }
  }

  /**
   * Format currency from cents
   */
  function formatCurrency(cents) {
    if (!cents) return '$0.00';
    return '$' + (cents / 100).toFixed(2);
  }

  /**
   * Format date for display
   */
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Format percentage
   */
  function formatPercentage(value) {
    if (!value) return 'N/A';
    return (value / 100).toFixed(2) + '%';
  }

  /**
   * Update page elements with class data
   */
  function updatePageElements(selectedClass) {
    // Update class ID on purchase button
    if (FIELD_MAPPINGS.purchaseButton) {
      const button = document.querySelector(FIELD_MAPPINGS.purchaseButton.selector);
      if (button) {
        button.setAttribute('data-class-code', selectedClass.classId || '');
      }
    }

    // Update all mapped fields
    Object.keys(FIELD_MAPPINGS).forEach(fieldName => {
      if (fieldName === 'purchaseButton') return; // Already handled
      
      const mapping = FIELD_MAPPINGS[fieldName];
      const elements = document.querySelectorAll(mapping.selector);
      
      if (elements.length === 0) return;
      
      let value = selectedClass[fieldName];
      
      // Format values based on field type
      if (fieldName === 'price' || fieldName === 'registrationFee') {
        value = formatCurrency(value);
      } else if (fieldName.includes('Date') || fieldName.includes('Start') || fieldName.includes('Close')) {
        value = formatDate(value);
      } else if (fieldName === 'graduationRate') {
        value = formatPercentage(value);
      } else if (fieldName === 'isOnline') {
        value = value ? 'Yes' : 'No';
      } else if (value === null || value === undefined) {
        value = 'N/A';
      }
      
      elements.forEach(el => {
        if (mapping.attribute.startsWith('data-')) {
          const attrName = mapping.attribute.replace('data-', '');
          el.setAttribute(`data-${attrName}`, value);
        } else if (mapping.attribute === 'value') {
          el.value = value;
        } else {
          el[mapping.attribute] = value;
        }
      });
    });
  }

  /**
   * Create and populate class selector dropdown
   */
  function createClassSelector(classes) {
    // Find or create the selector container
    let selectorContainer = document.querySelector('[data-class-selector-container]');
    if (!selectorContainer) {
      // Create a default container if none exists
      selectorContainer = document.createElement('div');
      selectorContainer.setAttribute('data-class-selector-container', '');
      selectorContainer.style.margin = '20px 0';
      
      // Try to insert before purchase button, or append to body
      const purchaseButton = document.querySelector('[data-purchase-button]');
      if (purchaseButton && purchaseButton.parentNode) {
        purchaseButton.parentNode.insertBefore(selectorContainer, purchaseButton);
      } else {
        document.body.appendChild(selectorContainer);
      }
    }

    // Create select element
    const select = document.createElement('select');
    select.setAttribute('data-class-selector', '');
    select.style.width = '100%';
    select.style.padding = '10px';
    select.style.fontSize = '16px';
    select.style.border = '1px solid #ccc';
    select.style.borderRadius = '4px';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a class...';
    select.appendChild(defaultOption);

    // Add class options
    classes.forEach((classItem, index) => {
      const option = document.createElement('option');
      option.value = index.toString();
      option.textContent = `${classItem.classId} - ${formatDate(classItem.classStartDate)}`;
      if (classItem.location) {
        option.textContent += ` (${classItem.location})`;
      }
      select.appendChild(option);
    });

    // Handle selection change
    select.addEventListener('change', function() {
      const selectedIndex = parseInt(this.value);
      if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < classes.length) {
        updatePageElements(classes[selectedIndex]);
      }
    });

    selectorContainer.innerHTML = '';
    selectorContainer.appendChild(select);

    // Auto-select first class if only one option
    if (classes.length === 1) {
      select.value = '0';
      select.dispatchEvent(new Event('change'));
    }
  }

  /**
   * Initialize the class selector
   */
  async function init() {
    const slug = getCourseSlugFromURL();
    
    if (!slug) {
      console.warn('Webflow Class Selector: Could not determine course slug from URL');
      return;
    }

    const classes = await fetchActiveClasses(slug);
    
    if (classes.length === 0) {
      console.warn('Webflow Class Selector: No active classes found for slug:', slug);
      // Optionally show a message to the user
      const messageEl = document.querySelector('[data-no-classes-message]');
      if (messageEl) {
        messageEl.style.display = 'block';
      }
      return;
    }

    createClassSelector(classes);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


