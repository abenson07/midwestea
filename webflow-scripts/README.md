# Webflow Scripts

These scripts are designed to be embedded in Webflow pages via Custom Code.

## Scripts Overview

### 1. `course-gallery-script.js`
**Page:** Course Gallery Page  
**Purpose:** Stores `course_code` and `class_id` in localStorage when a user clicks a course card.

**Requirements:**
- Course cards must have `data-course-code` and `data-class-id` attributes
- These should be bound from CMS fields

**How to use:**
1. Add this script to the Course Gallery page in Webflow
2. Place it in the page's Custom Code section (before `</body>` tag)
3. Ensure course cards have the required data attributes

---

### 2. `course-detail-url-handler.js`
**Page:** Course Detail Page  
**Purpose:** Reads `course_code` and `class_id` from URL hash parameters and updates the URL if values are found in localStorage or CMS button but not in the URL.

**URL Format:** `/basic-life-support#course_code=BLS#class_id=BLS-001`

**Requirements:**
- Add `data-checkout-button="cms"` to the button with CMS bindings for `data-course-code` and `data-class-id`

**How to use:**
1. Add this script to the Course Detail page in Webflow
2. Place it in the page's Custom Code section (before `</body>` tag)
3. This script should run before the button updater script

---

### 3. `course-detail-button-updater.js`
**Page:** Course Detail Page  
**Purpose:** Updates checkout buttons with `course_code` and `class_id` values from URL, CMS bindings, or localStorage. Also sets the `href` attribute to point to the checkout page.

**Requirements:**
- Add `data-checkout-button="cms"` to the button in `.class-checkout_button-wrap` (should have CMS bindings for `data-course-code` and `data-class-id`)
- Add `data-checkout-button="banner"` to the button in `.register-banner_content-right`

**How to use:**
1. Add this script to the Course Detail page in Webflow
2. Place it in the page's Custom Code section (after the URL handler script)
3. Add the `data-checkout-button` attributes to your buttons in Webflow Designer

---

## Installation Instructions

### For Course Gallery Page:
1. Open Webflow Designer
2. Go to your Course Gallery page
3. Open Page Settings → Custom Code
4. Paste `course-gallery-script.js` in the "Footer Code" section (before `</body>`)

### For Course Detail Page:
1. Open Webflow Designer
2. Go to your Course Detail page
3. Open Page Settings → Custom Code
4. Paste `course-detail-url-handler.js` in the "Footer Code" section (before `</body>`)
5. Paste `course-detail-button-updater.js` in the "Footer Code" section (after the URL handler)

---

## Notes

- All scripts are wrapped in IIFE (Immediately Invoked Function Expression) to avoid conflicts
- Scripts handle cases where values might not be available
- Console logging is included for debugging
- Scripts wait for DOM to be ready before executing

