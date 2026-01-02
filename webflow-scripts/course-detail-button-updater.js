/**
 * Course Detail Page - Button Updater Script
 * 
 * This script should be added to the Course Detail page in Webflow.
 * It updates checkout buttons with course_code and class_id values.
 * 
 * Requirements:
 * - Add data-checkout-button="cms" to the button in "class-checkout_button-wrap" (should have CMS bindings for data-course-code and data-class-id)
 * - Add data-checkout-button="banner" to the button in "register-banner_content-right"
 */

(function() {
  'use strict';

  /**
   * Parse hash parameters from URL
   * Format: #course_code=BLS#class_id=BLS-001
   */
  function parseHashParams() {
    const hash = window.location.hash;
    const params = {};
    
    if (!hash) {
      return params;
    }
    
    // Split by # and process each segment
    const segments = hash.split('#').filter(s => s);
    
    segments.forEach(function(segment) {
      const parts = segment.split('=');
      if (parts.length === 2) {
        params[parts[0]] = decodeURIComponent(parts[1]);
      }
    });
    
    return params;
  }

  /**
   * Get course values from URL, localStorage, or CMS button
   */
  function getCourseValues() {
    // First, try to get from URL hash
    const hashParams = parseHashParams();
    
    if (hashParams.course_code && hashParams.class_id) {
      return {
        courseCode: hashParams.course_code,
        classId: hashParams.class_id
      };
    }
    
    // If not in URL, try to get from the CMS-bound button
    // Check both lowercase and uppercase versions for case-insensitive matching
    const cmsButtonLower = document.querySelector('[data-checkout-button="cms"]');
    const cmsButtonUpper = document.querySelector('[data-checkout-button="CMS"]');
    const cmsButton = cmsButtonLower || cmsButtonUpper;
    
    if (cmsButton) {
      const courseCode = cmsButton.getAttribute('data-course-code');
      const classId = cmsButton.getAttribute('data-class-id');
      
      if (courseCode && classId) {
        return {
          courseCode: courseCode,
          classId: classId
        };
      }
    }
    
    // Last resort: try localStorage
    try {
      const courseCode = localStorage.getItem('webflow_course_code');
      const classId = localStorage.getItem('webflow_class_id');
      
      if (courseCode && classId) {
        return {
          courseCode: courseCode,
          classId: classId
        };
      }
    } catch (error) {
      console.error('Course Detail: Error reading from localStorage:', error);
    }
    
    return null;
  }

  /**
   * Update button with course values and checkout URL
   */
  function updateButton(button, courseCode, classId) {
    if (!button) {
      return false;
    }
    
    // Set both data- prefixed and non-prefixed versions for Webflow compatibility
    button.setAttribute('data-course-code', courseCode);
    button.setAttribute('data-class-id', classId);
    button.setAttribute('class-code', courseCode);
    button.setAttribute('class-id', classId);
    
    // Update href to point to checkout page with lowercase classId
    const checkoutUrl = '/app/checkout/details?classID=' + encodeURIComponent(classId.toLowerCase());
    button.setAttribute('href', checkoutUrl);
    
    return true;
  }

  /**
   * Initialize button updater
   */
  function init() {
    // Wait a bit for CMS bindings to populate
    setTimeout(function() {
      const values = getCourseValues();
      
      if (!values) {
        console.warn('Course Detail: No course_code or class_id found. Buttons will not be updated.');
        return;
      }
      
      // Find all checkout buttons using data attribute
      const checkoutButtons = document.querySelectorAll('[data-checkout-button]');
      
      checkoutButtons.forEach(function(button) {
        updateButton(button, values.courseCode, values.classId);
        console.log('Course Detail: Updated checkout button with course_code:', values.courseCode, 'class_id:', values.classId);
      });
      
      if (checkoutButtons.length === 0) {
        console.warn('Course Detail: No checkout buttons found with data-checkout-button attribute');
      }
    }, 100); // Small delay to ensure CMS bindings are loaded
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

