/**
 * Course Detail Page - URL Handler Script
 * 
 * This script should be added to the Course Detail page in Webflow.
 * It reads course_code and class_id from URL hash parameters and updates the URL if needed.
 * 
 * URL format: /basic-life-support#course_code=BLS#class_id=BLS-001
 * 
 * Requirements:
 * - Add data-checkout-button="cms" to the button with CMS bindings for data-course-code and data-class-id
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
   * Build hash string from parameters
   * If classId is not provided, only include course_code (for waitlist)
   */
  function buildHashString(courseCode, classId) {
    if (classId) {
      return '#course_code=' + encodeURIComponent(courseCode) + '#class_id=' + encodeURIComponent(classId);
    } else {
      return '#course_code=' + encodeURIComponent(courseCode);
    }
  }

  /**
   * Update URL with hash parameters (without page reload)
   */
  function updateURL(courseCode, classId) {
    const newHash = buildHashString(courseCode, classId);
    
    // Update URL hash without reloading
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, window.location.pathname + newHash);
    } else {
      window.location.hash = newHash;
    }
  }

  /**
   * Get values from URL, localStorage, or CMS button
   * Returns courseCode and optionally classId (classId may be null for waitlist)
   */
  function getCourseValues() {
    // First, try to get from URL hash
    const hashParams = parseHashParams();
    
    if (hashParams.course_code) {
      return {
        courseCode: hashParams.course_code,
        classId: hashParams.class_id || null,
        source: 'url'
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
      
      if (courseCode) {
        return {
          courseCode: courseCode,
          classId: classId || null,
          source: 'cms'
        };
      }
    }
    
    // Check for waitlist button
    const waitlistButton = document.querySelector('[data-checkout-button="waitlist"]');
    if (waitlistButton) {
      const courseCode = waitlistButton.getAttribute('data-course-code');
      if (courseCode) {
        return {
          courseCode: courseCode,
          classId: null,
          source: 'waitlist'
        };
      }
    }
    
    // If not found, try localStorage
    try {
      const courseCode = localStorage.getItem('webflow_course_code');
      const classId = localStorage.getItem('webflow_class_id');
      
      if (courseCode) {
        return {
          courseCode: courseCode,
          classId: classId || null,
          source: 'localStorage'
        };
      }
    } catch (error) {
      console.error('Course Detail: Error reading from localStorage:', error);
    }
    
    return null;
  }

  /**
   * Initialize URL handler
   */
  function init() {
    const values = getCourseValues();
    
    if (!values) {
      console.warn('Course Detail: No course_code found in URL, CMS button, waitlist button, or localStorage');
      return;
    }
    
    // If values came from localStorage, CMS, or waitlist button but not URL, update URL
    if (values.source === 'localStorage' || values.source === 'cms' || values.source === 'waitlist') {
      updateURL(values.courseCode, values.classId);
      if (values.classId) {
        console.log('Course Detail: Updated URL with course_code:', values.courseCode, 'class_id:', values.classId);
      } else {
        console.log('Course Detail: Updated URL with course_code:', values.courseCode, '(waitlist - no class_id)');
      }
    } else {
      if (values.classId) {
        console.log('Course Detail: Found course_code:', values.courseCode, 'class_id:', values.classId, 'in URL');
      } else {
        console.log('Course Detail: Found course_code:', values.courseCode, 'in URL (waitlist - no class_id)');
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

