# Navbar

## Source & target
- **Webflow file**: `midwestea.webflow/navbar.html`
- **Target route**: `N/A (shared component)`
- **Reference template**: `N/A`
- **Purpose**: Extract shared UI into reusable React components — not a standalone page route.

## Component to build: `components/navigation.tsx`

This file is the isolated navigation component. The same block is duplicated at the bottom of every content page.

### Structure (DOM order)
1. `div.banner` — promo strip
2. `div.navigation-wrapper` → `div.navbar3_component`
3. Programs mega-menu (`navbar-dropdown2_component`)
4. Courses mega-menu (`navbar-dropdown2_component`)
5. Logo link → `/`
6. Mobile menu button

### Banner content (verbatim)
- **Line 1**: "Paramedic class open"
- **Line 2**: "Seats are filling up quickly."
- **CTA**: [Register now](paramedic.html) → target `/paramedic`

### Programs dropdown links
- [Register now](paramedic.html)
- [Not sure where to start? From registration to certification, we’ve got your back. See how it works](how-it-works/programs.html)
- [Emergency Medical Response](emergency-medical-responder.html)
- [Paramedic](paramedic.html)
- [Critical Care Transport](critical-care-transport.html)
- [Emergency Medical Technician](emergency-medical-technician.html)
- [Community Paramedic](community-paramedic.html)
- [Advanced Tatical Casualty Care](advanced-tactical-casualty-care.html)

### Courses dropdown links
- [Not sure where to start? From registration to certification, we’ve got your back. See how it works](how-it-works/couress.html)
- [Advanced Cardiovascular Life Support](advanced-cardiovascular-life-support.html)
- [Basic Life Support](basic-life-support.html)
- [CPR / First Aid](cpr-first-aid.html)
- [Child & Babysitting Safety](child-and-babysitting-safety.html)
- [Active Violence Emergency Response](active-shooter-training.html)
- [Pediatric CPR](pediatric-first-aid-cpr-aed.html)
- [Emergency Oxygen](emergency-use-of-medical-oxygen.html)
- [Pediatric Advanced Life Support](pediatric-advanced-life-support.html)
- [Bloodborne Pathogens](bloodborne-pathogens.html)
- [Epinephrine](use-and-administration-of-epinephrine-auto-injectors.html)

### Testimonial in dropdown (verbatim)
- Quote: "The hands-on scenarios made a huge difference — I left feeling confident I could actually respond in a real emergency. The instructors were knowledgeable, supportive, and kept the training engaging from start to finish."
- Attribution: "John Smith, Fire Chief"

### Assets
- Logo: inline SVG in `div.logo-embed.color` (also `images/Logo.svg`, `images/Logo-wide.svg`)

## Implementation checklist
- [ ] Extract markup into shared React component(s)
- [ ] Wire into `app/layout.tsx` (navigation/footer) or Next.js utility routes
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- No PageRenderer entry needed unless building a standalone utility page
