# Privacy Policy

## Source & target
- **Webflow file**: `midwestea.webflow/privacy-policy.html`
- **Target route**: `/privacy-policy`
- **Reference template**: `/terms-of-service`
- **Template gap notes**: Route /privacy-policy does not exist yet; same pattern as terms-of-service.

## Page metadata (from `<head>`)
- **title**: Privacy Policy
- **og:title**: Privacy Policy

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 402, 403, 477

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `content-hero` | ~296 | Header 64 | `header-64.tsx` | update-content |
| 2 | `section_content7` | ~313 | Content 7 | `content-7.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `content-hero`
- **Webflow HTML line**: ~296
- **Webflow classes**: `content-hero`
- **Component file**: `header-64.tsx`
- **Action**: update-content
- **Headings**:
  - h1: "Privacy Policy"
  - h4: "Information We Collect"
  - h4: "How We Use Your Information"
  - h4: "How We Share Your Information"
  - h4: "Payment Information"
  - h4: "Cookies and Tracking Technologies"
  - h4: "Data Retention"
  - h4: "Security Measures"
  - h4: "Your Rights and Choices"
  - h4: "Children’s Privacy"
  - h4: "Third-Party Links"
  - h4: "Changes to This Policy"
  - h4: "Contact Information"
- **Paragraphs**:
  - "Last Updated: 11/22/2024"
  - "We collect personal information that you provide when accessing or using MidwestEA services, including:"
  - "We collect this information to deliver training, maintain course records, provide support, and improve our services."
  - "MidwestEA uses your information to:"
  - "We do not sell your information to third parties."
  - "We may share your information with:"
  - "All partners are required to protect your information according to industry standards."
  - "Payment transactions are processed by secure, third-party payment providers. MidwestEA does not store full credit card numbers or sensitive financial data on our servers."
  - "We use cookies and similar technologies to:"
  - "You may disable cookies through your browser settings, though some features may not function properly."
  - _(+10 more paragraphs)_
- **Links**:
  - [www.midwestea.com](http://www.midwestea.com)
  - [Contact Us](contact.html)
  - [FAQ](faq.html)
  - [Basic Life Support](basic-life-support.html)
  - [Advanced Cardiovascular Life Support](advanced-cardiovascular-life-support.html)
  - [Active Violence Emergency Response Training](active-shooter-training.html)
  - [Pediatric Advanced Life Support](pediatric-advanced-life-support.html)
  - [CPR/First Aid](cpr-first-aid.html)
  - [Pediatric CPR](pediatric-first-aid-cpr-aed.html)
  - [Child and Babysitting Safety](child-and-babysitting-safety.html)
- **Images** (1):
  - src: `images/MidwestEAlogo_MidwestEA_lockup_white.svg`

### Section 2: `section_content7`
- **Webflow HTML line**: ~313
- **Webflow classes**: `section_content7`
- **Component file**: `content-7.tsx`
- **Action**: update-content
- **Headings**:
  - h4: "Information We Collect"
  - h4: "How We Use Your Information"
  - h4: "How We Share Your Information"
  - h4: "Payment Information"
  - h4: "Cookies and Tracking Technologies"
  - h4: "Data Retention"
  - h4: "Security Measures"
  - h4: "Your Rights and Choices"
  - h4: "Children’s Privacy"
  - h4: "Third-Party Links"
  - h4: "Changes to This Policy"
  - h4: "Contact Information"
- **Paragraphs**:
  - "We collect personal information that you provide when accessing or using MidwestEA services, including:"
  - "We collect this information to deliver training, maintain course records, provide support, and improve our services."
  - "MidwestEA uses your information to:"
  - "We do not sell your information to third parties."
  - "We may share your information with:"
  - "All partners are required to protect your information according to industry standards."
  - "Payment transactions are processed by secure, third-party payment providers. MidwestEA does not store full credit card numbers or sensitive financial data on our servers."
  - "We use cookies and similar technologies to:"
  - "You may disable cookies through your browser settings, though some features may not function properly."
  - "We retain course and certification records to meet regulatory requirements and provide verification when needed. Personal account information is retained only as long as necessary to provide services or comply with the law."
  - _(+9 more paragraphs)_
- **Links**:
  - [www.midwestea.com](http://www.midwestea.com)
  - [Contact Us](contact.html)
  - [FAQ](faq.html)
  - [Basic Life Support](basic-life-support.html)
  - [Advanced Cardiovascular Life Support](advanced-cardiovascular-life-support.html)
  - [Active Violence Emergency Response Training](active-shooter-training.html)
  - [Pediatric Advanced Life Support](pediatric-advanced-life-support.html)
  - [CPR/First Aid](cpr-first-aid.html)
  - [Pediatric CPR](pediatric-first-aid-cpr-aed.html)
  - [Child and Babysitting Safety](child-and-babysitting-safety.html)
- **Images** (1):
  - src: `images/MidwestEAlogo_MidwestEA_lockup_white.svg`

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 1 |

## Interactions / JS
- None detected beyond `midwestea.webflow/js/midwestea.js`
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/privacy-policy/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
