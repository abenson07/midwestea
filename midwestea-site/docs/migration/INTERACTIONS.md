# JavaScript interactions — porting map

Do **not** import [`midwestea.webflow/js/midwestea.js`](../../midwestea.webflow/js/midwestea.js) (~509KB Webflow runtime). Port only the behaviors each page needs using React-friendly implementations.

Add npm dependencies only when migrating the first page that requires them.

## Implemented in Phase 0

| Behavior | Component | Approach |
|----------|-----------|----------|
| Nav dropdowns | [`components/navigation.tsx`](../../components/navigation.tsx) | React `useState` |
| Nav scroll-hide | [`hooks/use-scroll-hide-nav.ts`](../../hooks/use-scroll-hide-nav.ts) | `useEffect` scroll listener |
| FAQ accordions | [`components/faq-6.tsx`](../../components/faq-6.tsx) | Relume `Accordion` |

## Deferred — add deps when page is migrated

| Behavior | First page | Approach | npm package |
|----------|------------|----------|-------------|
| Home hero slider | `index` | React + GSAP Observer + CustomEase | `gsap` |
| Carousel sliders | `index` | Swiper React wrapper | `swiper` |
| Ways-to-learn toggles | `index` | GSAP slide on card state | `gsap` |
| Program hero scroll | Program detail pages | `useEffect` + ScrollTrigger | `gsap` |
| Programs scroller | `programs` | React scroll + ScrollTrigger pin/reveal | `gsap` |
| Register bottom banner | Course/program pages | ScrollTrigger show/hide vs hero & footer | `gsap` |
| Who-it's-for card hover | Course pages | React hover state (replace jQuery) | none |
| Course checkout URL sync | Course detail pages | Custom hook: hash `#course_code` / `#class_id`, localStorage | none |
| Webflow IX2 (`data-w-id`) | Various | Reimplement per interaction in React | varies |

## Source references

Inline scripts live in Webflow HTML exports, not in `midwestea.js`. Check each page's migration doc **Interactions / JS** section and the corresponding `midwestea.webflow/<slug>.html` file.

Common external CDNs in the export (for reference only — install via npm in Next.js):

- GSAP 3.12–3.15 (+ ScrollTrigger, Observer, CustomEase)
- Swiper 12
- jQuery 3.5 (avoid in Next.js — use React instead)

## Implementation notes

- Prefer `"use client"` components with `useEffect` for scroll/animation hooks.
- Register GSAP plugins once per component or in a shared `lib/gsap.ts` helper when first needed.
- Do not load Webflow's `midwestea.js`, jQuery, or WebFont loader in production.
