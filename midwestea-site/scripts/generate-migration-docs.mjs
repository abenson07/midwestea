#!/usr/bin/env node
/**
 * Generates docs/migration/*.md from midwestea.webflow HTML exports.
 * Run: node scripts/generate-migration-docs.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const WEBFLOW_DIR = path.join(ROOT, "midwestea.webflow");
const OUT_DIR = path.join(ROOT, "docs", "migration");

/** Webflow class fragment → component mapping */
const CLASS_TO_COMPONENT = [
  { match: /section_image-scale-header|header108/, component: "Header 108", file: "header-108.tsx", action: "update-content" },
  { match: /section_layout137|layout137/, component: "Layout 137", file: "layout-137.tsx", action: "update-content" },
  { match: /section_layout1(?:[^0-9]|$)|layout1_component/, component: "Layout 1", file: "layout-1.tsx", action: "update-content" },
  { match: /section_layout228|layout228/, component: "Layout 228", file: "layout-228.tsx", action: "update-content" },
  { match: /section_stats33|stats33/, component: "Stats 33", file: "stats-33.tsx", action: "update-content" },
  { match: /section_team2|team2/, component: "Team 2", file: "team-2.tsx", action: "update-content" },
  { match: /section_testimonial3|testimonial3/, component: "Testimonial 3", file: "testimonial-3.tsx", action: "update-content" },
  { match: /section_cta36|cta36/, component: "CTA 36", file: "cta-36.tsx", action: "update-content" },
  { match: /section_content7|content7_component/, component: "Content 7", file: "content-7.tsx", action: "update-content" },
  { match: /section_hero-header|header60/, component: "Header 60", file: "header-60.tsx", action: "update-content" },
  { match: /section_class-grid|product1/, component: "Product 1", file: "product-1.tsx", action: "update-content" },
  { match: /section_testimonial-small|testimonial1/, component: "Testimonial 1", file: "testimonial-1.tsx", action: "update-content" },
  { match: /section_course-header|product-header|course-header/, component: "Product Header 6", file: "product-header-6.tsx", action: "update-content" },
  { match: /section_gallery22|gallery22/, component: "Gallery 22", file: "gallery-22.tsx", action: "update-content" },
  { match: /section_who-its-for|layout423/, component: "Layout 423", file: "layout-423.tsx", action: "update-content" },
  { match: /section_layout493|layout493/, component: "Layout 493", file: "layout-493.tsx", action: "update-content" },
  { match: /section-feature-grid|layout520/, component: "Layout 520", file: "layout-520.tsx", action: "update-content" },
  { match: /section_layout349|layout349/, component: "Layout 349", file: "layout-349.tsx", action: "update-content" },
  { match: /section_layout54|layout54/, component: "Layout 54", file: "layout-54.tsx", action: "update-content" },
  { match: /section_faq(?:[^s]|$)|faq6_accordion/, component: "FAQ 6", file: "faq-6.tsx", action: "update-content" },
  { match: /content-hero|header64_component/, component: "Header 64", file: "header-64.tsx", action: "update-content" },
  { match: /policy-hero/, component: "Header 64", file: "header-64.tsx", action: "extend-component" },
  { match: /section_policy-content/, component: "Content 7", file: "content-7.tsx", action: "extend-component" },
  { match: /section_home-hero/, component: "HomeHero", file: "components/home-hero.tsx (NEW)", action: "build-custom" },
  { match: /section-programs|mission-section/, component: "HomePrograms", file: "components/home-programs.tsx (NEW)", action: "build-custom" },
  { match: /section_ways-to-learn/, component: "WaysToLearn", file: "components/ways-to-learn.tsx (NEW)", action: "build-custom" },
  { match: /section_testimonial[^-]/, component: "HomeTestimonial", file: "components/home-testimonial.tsx (NEW)", action: "build-custom" },
  { match: /section_trainers|trainers_component/, component: "Trainers", file: "components/trainers.tsx (NEW)", action: "build-custom" },
  { match: /section-courses-home/, component: "CoursesHome", file: "components/courses-home.tsx (NEW)", action: "build-custom" },
  { match: /hero-track/, component: "ProgramHero", file: "components/program-hero.tsx (NEW)", action: "build-custom" },
  { match: /program-ui/, component: "EnrollmentBar", file: "components/enrollment-bar.tsx (NEW)", action: "build-custom" },
  { match: /section-program-hero/, component: "ProgramGalleryHero", file: "components/program-gallery-hero.tsx (NEW)", action: "build-custom" },
  { match: /programs-scroller|program-panel/, component: "ProgramsScroller", file: "components/programs-scroller.tsx (NEW)", action: "build-custom" },
  { match: /section_faqs\.hero|section_faqs hero|faqs_component/, component: "FaqHero", file: "components/faq-hero.tsx (NEW)", action: "build-custom" },
  { match: /contact_component/, component: "ContactSection", file: "components/contact-section.tsx (NEW)", action: "build-custom" },
  { match: /checkout-section/, component: "CheckoutDetails", file: "components/checkout-details.tsx (NEW)", action: "build-custom" },
  { match: /utility_component/, component: "UtilityPage", file: "components/utility-page.tsx (NEW)", action: "build-custom" },
  { match: /section_faqs/, component: "FAQ 6", file: "faq-6.tsx", action: "update-content" },
  { match: /navigation\.navigation-component|navigation-component/, component: "Navigation", file: "components/navigation.tsx (NEW)", action: "skip-chrome" },
  { match: /footer\.footer_component|footer_component/, component: "Footer", file: "components/footer.tsx (NEW)", action: "skip-chrome" },
  { match: /section_footer-group/, component: "Footer wrapper", file: "components/footer.tsx (NEW)", action: "skip-chrome" },
  { match: /global-styles/, component: "—", file: "—", action: "skip-chrome" },
  { match: /rl-styleguide|style-guide/, component: "StyleGuide", file: "reference only", action: "skip-chrome" },
];

const PAGE_CONFIG = {
  "index.html": { route: "/", template: "NEW TEMPLATE REQUIRED", title: "Home" },
  "about.html": { route: "/about", template: "/about" },
  "programs.html": { route: "/programs", template: "/program-gallery" },
  "courses.html": { route: "/courses", template: "/course-gallery" },
  "faq.html": { route: "/faq", template: "/faq", gaps: "Reference template uses FAQ 6 only; Webflow uses section_faqs.hero with left nav + grouped FAQs." },
  "contact.html": { route: "/contact", template: "/contact", gaps: "Reference template uses FAQ 6 only; Webflow uses contact_component + FAQ accordions." },
  "policies.html": { route: "/policies", template: "/policies-list", gaps: "Reference template uses FAQ 6 only; Webflow uses section_faqs.hero with policy CMS list." },
  "detail_policies.html": { route: "/policies/[slug]", template: "/policy", gaps: "Dynamic CMS template; export has w-dyn-bind-empty placeholders." },
  "terms-of-service.html": { route: "/terms-of-service", template: "/terms-of-service" },
  "privacy-policy.html": { route: "/privacy-policy", template: "/terms-of-service", gaps: "Route /privacy-policy does not exist yet; same pattern as terms-of-service." },
  "404.html": { route: "/not-found", template: "NEW TEMPLATE REQUIRED" },
  "401.html": { route: "/401", template: "NEW TEMPLATE REQUIRED" },
  "navbar.html": { route: "N/A (shared component)", template: "N/A" },
  "style-guide.html": { route: "N/A (design reference)", template: "N/A" },
  "untitled.html": { route: "N/A (dev sandbox)", template: "N/A" },
  "checkout/details.html": { route: "/checkout/details", template: "NEW TEMPLATE REQUIRED" },
  "how-it-works/programs.html": { route: "/how-it-works/programs", template: "partial Layout 493" },
  "how-it-works/couress.html": { route: "/how-it-works/couress", template: "partial Layout 493" },
};

const COURSE_PAGES = new Set([
  "basic-life-support.html",
  "advanced-cardiovascular-life-support.html",
  "pediatric-advanced-life-support.html",
  "cpr-first-aid.html",
  "pediatric-first-aid-cpr-aed.html",
  "child-and-babysitting-safety.html",
  "active-shooter-training.html",
  "bloodborne-pathogens.html",
  "emergency-use-of-medical-oxygen.html",
  "use-and-administration-of-epinephrine-auto-injectors.html",
]);

const PROGRAM_PAGES = new Set([
  "emergency-medical-responder.html",
  "emergency-medical-technician.html",
  "paramedic.html",
  "community-paramedic.html",
  "critical-care-transport.html",
  "advanced-tactical-casualty-care.html",
]);

const PURCHASE_CONFIRMATION_PAGES = new Set([
  "purchase-confirmation/general.html",
  "purchase-confirmation/acls.html",
  "purchase-confirmation/atcc.html",
  "purchase-confirmation/avert.html",
  "purchase-confirmation/babysitting.html",
  "purchase-confirmation/bls.html",
  "purchase-confirmation/bloodborne.html",
  "purchase-confirmation/cct.html",
  "purchase-confirmation/cp.html",
  "purchase-confirmation/cpr.html",
  "purchase-confirmation/emr.html",
  "purchase-confirmation/emt.html",
  "purchase-confirmation/epinephrine.html",
  "purchase-confirmation/oxygen.html",
  "purchase-confirmation/pals.html",
  "purchase-confirmation/paramedic.html",
  "purchase-confirmation/pediatric-cpr.html",
]);

function getPageConfig(relPath) {
  if (PAGE_CONFIG[relPath]) return PAGE_CONFIG[relPath];
  const base = path.basename(relPath);
  if (COURSE_PAGES.has(base)) {
    return { route: `/${base.replace(".html", "")}`, template: "/course-template" };
  }
  if (PROGRAM_PAGES.has(base)) {
    const gaps =
      base === "emergency-medical-technician.html"
        ? "Webflow omits section_layout54 on this page. Reference /program-template omits section_trainers."
        : "Reference /program-template omits section_trainers (present in Webflow between Layout 54 and Layout 493).";
    return { route: `/${base.replace(".html", "")}`, template: "/program-template", gaps };
  }
  if (PURCHASE_CONFIRMATION_PAGES.has(relPath)) {
    const slug = path.basename(relPath, ".html");
    return {
      route: `/purchase-confirmation/${slug}`,
      template: "/order-confirmation",
      gaps: "Reference template uses CustomPlaceholder Confirmation only.",
    };
  }
  return { route: `/${base.replace(".html", "")}`, template: "UNKNOWN" };
}

function lineNumberAt(html, index) {
  return html.slice(0, index).split("\n").length;
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html) {
  const get = (pattern) => {
    const m = html.match(pattern);
    return m ? decodeHtml(m[1]) : null;
  };
  return {
    title: get(/<title>([^<]*)<\/title>/i),
    description:
      get(/name="description"\s+content="([^"]*)"/i) ||
      get(/content="([^"]*)"\s+name="description"/i),
    ogTitle:
      get(/property="og:title"\s+content="([^"]*)"/i) ||
      get(/content="([^"]*)"\s+property="og:title"/i),
    ogDescription:
      get(/property="og:description"\s+content="([^"]*)"/i) ||
      get(/content="([^"]*)"\s+property="og:description"/i),
    ogImage:
      get(/property="og:image"\s+content="([^"]*)"/i) ||
      get(/content="([^"]*)"\s+property="og:image"/i),
    robots: get(/name="robots"\s+content="([^"]*)"/i),
  };
}

function mapSection(classStr, tagName) {
  const hay = `${tagName} ${classStr}`;
  for (const entry of CLASS_TO_COMPONENT) {
    if (entry.match.test(hay)) return entry;
  }
  return { component: "UNMAPPED", file: "—", action: "build-custom" };
}

const SKIP_CLASSES = /^(main-wrapper|global-styles|page-wrapper|padding-global|container-large|style-overrides)$/;

function extractSections(html) {
  const sections = [];
  const seen = new Set();

  // Match opening tags for main content blocks
  const patterns = [
    /<header[^>]*class="([^"]*)"[^>]*>/gi,
    /<section[^>]*class="([^"]*)"[^>]*>/gi,
    /<div[^>]*class="([^"]*hero-track[^"]*)"[^>]*>/gi,
    /<div[^>]*class="([^"]*section-programs[^"]*)"[^>]*>/gi,
    /<div[^>]*class="([^"]*section_home-hero[^"]*)"[^>]*>/gi,
    /<div[^>]*class="([^"]*programs-scroller[^"]*)"[^>]*>/gi,
    /<div[^>]*class="([^"]*utility_component[^"]*)"[^>]*>/gi,
    /<div[^>]*class="([^"]*checkout-section[^"]*)"[^>]*>/gi,
    /<div[^>]*class="([^"]*navigation[^"]*navigation-component[^"]*)"[^>]*>/gi,
    /<div[^>]*class="([^"]*section_footer-group[^"]*)"[^>]*>/gi,
    /<footer[^>]*class="([^"]*footer_component[^"]*)"[^>]*>/gi,
  ];

  for (const pattern of patterns) {
    let m;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((m = re.exec(html)) !== null) {
      const fullMatch = m[0];
      const classStr = m[1] || fullMatch.match(/class="([^"]*)"/)?.[1] || "";
      const tag = fullMatch.match(/^<(\w+)/)?.[1] || "div";
      const line = lineNumberAt(html, m.index);
      const primary =
        classStr.split(/\s+/).find((c) => c.startsWith("section_") || c.startsWith("section-") || c.includes("hero-track") || c.includes("program") || c.includes("checkout") || c.includes("utility") || c.includes("navigation") || c.includes("footer") || c.includes("content-hero") || c.includes("policy-hero") || c.includes("mission")) ||
        classStr.split(/\s+/)[0];
      if (SKIP_CLASSES.test(primary)) continue;
      const key = `${line}:${primary}`;
      if (seen.has(key)) continue;
      // Skip nested layout wrappers
      if (classStr.includes("w-layout-grid") || classStr === "padding-global") continue;
      seen.add(key);
      const mapping = mapSection(classStr, tag);
      sections.push({
        line,
        tag,
        classes: classStr,
        primaryClass: primary,
        ...mapping,
      });
    }
  }

  sections.sort((a, b) => a.line - b.line);

  // Deduplicate consecutive same-component chrome
  const filtered = [];
  for (const s of sections) {
    if (s.action === "skip-chrome" && filtered.some((f) => f.component === s.component && f.action === "skip-chrome")) continue;
    filtered.push(s);
  }
  return filtered;
}

function extractBlock(html, startLine) {
  const lines = html.split("\n");
  const start = Math.max(0, startLine - 1);
  const chunk = lines.slice(start, start + 200).join("\n");
  return chunk;
}

function extractHeadings(block) {
  const results = [];
  const re = /<h([1-5])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    const text = decodeHtml(m[2]);
    if (text && !text.includes("w-dyn-bind-empty")) results.push({ level: m[1], text });
  }
  return results;
}

function extractParagraphs(block) {
  const results = [];
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    const raw = m[1];
    if (raw.includes("w-dyn-bind-empty") && decodeHtml(raw).length < 3) continue;
    const text = decodeHtml(raw);
    if (text && text.length > 2) results.push(text);
  }
  return results;
}

function extractLinks(block) {
  const results = [];
  const re = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    const text = decodeHtml(m[2]);
    if (text) results.push({ href: m[1], text });
  }
  return results;
}

function extractImages(block) {
  const results = [];
  const re = /<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    results.push({ src: m[1], alt: m[2] || "" });
  }
  return results;
}

function extractFaqs(block) {
  const faqs = [];
  const re = /class="faq6_question"[^>]*>[\s\S]*?<div class="text-size-medium[^"]*">([\s\S]*?)<\/div>[\s\S]*?class="faq6_answer"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    faqs.push({ title: decodeHtml(m[1]), answer: decodeHtml(m[2]) });
  }
  return faqs;
}

function extractTabs(block) {
  const tabs = [];
  const re = /class="layout493_tab-link[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    tabs.push({ title: decodeHtml(m[1]), description: decodeHtml(m[2]) });
  }
  return tabs;
}

function extractTaglines(block) {
  const results = [];
  const re = /class="text-style-tagline"[^>]*>([\s\S]*?)<\//gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    const t = decodeHtml(m[1]);
    if (t) results.push(t);
  }
  return results;
}

function extractScripts(html) {
  const scripts = [];
  if (html.includes("gsap")) scripts.push("GSAP");
  if (html.includes("ScrollTrigger")) scripts.push("ScrollTrigger");
  if (html.includes("Observer")) scripts.push("GSAP Observer");
  if (html.includes("swiper")) scripts.push("Swiper 12");
  if (html.includes("stripe.com")) scripts.push("Stripe checkout links");
  if (html.includes("hero-track")) scripts.push("Inline hero-track scroll script");
  if (html.includes("programs-scroller")) scripts.push("Inline programs-scroller script");
  return [...new Set(scripts)];
}

function formatSectionContent(section, html) {
  const block = extractBlock(html, section.line);
  const headings = extractHeadings(block);
  const paragraphs = extractParagraphs(block);
  const links = extractLinks(block);
  const images = extractImages(block);
  const faqs = extractFaqs(block);
  const tabs = extractTabs(block);
  const taglines = extractTaglines(block);

  const lines = [];
  lines.push(`### Section ${section.index}: \`${section.primaryClass}\``);
  lines.push(`- **Webflow HTML line**: ~${section.line}`);
  lines.push(`- **Webflow classes**: \`${section.classes}\``);
  lines.push(`- **Component file**: \`${section.file}\``);
  lines.push(`- **Action**: ${section.action}`);

  if (taglines.length) {
    lines.push(`- **Tagline(s)**:`);
    taglines.forEach((t) => lines.push(`  - "${t}"`));
  }
  if (headings.length) {
    lines.push(`- **Headings**:`);
    headings.slice(0, 15).forEach((h) => lines.push(`  - h${h.level}: "${h.text}"`));
    if (headings.length > 15) lines.push(`  - _(+${headings.length - 15} more headings)_`);
  }
  if (paragraphs.length) {
    lines.push(`- **Paragraphs**:`);
    paragraphs.slice(0, 10).forEach((p) => lines.push(`  - "${p.slice(0, 500)}${p.length > 500 ? "…" : ""}"`));
    if (paragraphs.length > 10) lines.push(`  - _(+${paragraphs.length - 10} more paragraphs)_`);
  }
  if (faqs.length) {
    lines.push(`- **FAQ items** (${faqs.length}):`);
    faqs.forEach((f, i) => {
      lines.push(`  - \`questions[${i}].title\`: "${f.title}"`);
      lines.push(`  - \`questions[${i}].answer\`: "${f.answer.slice(0, 300)}${f.answer.length > 300 ? "…" : ""}"`);
    });
  }
  if (tabs.length) {
    lines.push(`- **Tabs** (${tabs.length}):`);
    tabs.forEach((t, i) => {
      lines.push(`  - \`tabs[${i}].title\`: "${t.title}"`);
      lines.push(`  - \`tabs[${i}].description\`: "${t.description.slice(0, 200)}${t.description.length > 200 ? "…" : ""}"`);
    });
  }
  if (links.length) {
    const unique = links.filter((l) => !l.href.startsWith("#") && l.text.length > 1).slice(0, 10);
    if (unique.length) {
      lines.push(`- **Links**:`);
      unique.forEach((l) => lines.push(`  - [${l.text}](${l.href})`));
    }
  }
  if (images.length) {
    lines.push(`- **Images** (${images.length}):`);
    images.slice(0, 8).forEach((img) => lines.push(`  - src: \`${img.src}\`${img.alt ? `, alt: "${img.alt}"` : ""}`));
    if (images.length > 8) lines.push(`  - _(+${images.length - 8} more images)_`);
  }
  if (block.includes("w-dyn-bind-empty") || block.includes("w-dyn-list")) {
    lines.push(`- **CMS note**: Contains \`w-dyn-bind-empty\` or \`w-dyn-list\` — dynamic fields need a data source at implementation time.`);
  }

  return lines.join("\n");
}

function generateSpecialDoc(relPath, html, config) {
  const meta = extractMeta(html);
  const pageTitle = meta.title || path.basename(relPath, ".html");
  const lines = [];

  lines.push(`# ${pageTitle}`);
  lines.push("");
  lines.push("## Source & target");
  lines.push(`- **Webflow file**: \`midwestea.webflow/${relPath}\``);
  lines.push(`- **Target route**: \`${config.route}\``);
  lines.push(`- **Reference template**: \`${config.template}\``);
  lines.push(`- **Purpose**: Extract shared UI into reusable React components — not a standalone page route.`);
  lines.push("");

  if (relPath === "navbar.html") {
    lines.push("## Component to build: `components/navigation.tsx`");
    lines.push("");
    lines.push("This file is the isolated navigation component. The same block is duplicated at the bottom of every content page.");
    lines.push("");
    lines.push("### Structure (DOM order)");
    lines.push("1. `div.banner` — promo strip");
    lines.push("2. `div.navigation-wrapper` → `div.navbar3_component`");
    lines.push("3. Programs mega-menu (`navbar-dropdown2_component`)");
    lines.push("4. Courses mega-menu (`navbar-dropdown2_component`)");
    lines.push("5. Logo link → `/`");
    lines.push("6. Mobile menu button");
    lines.push("");
    lines.push("### Banner content (verbatim)");
    lines.push('- **Line 1**: "Paramedic class open"');
    lines.push('- **Line 2**: "Seats are filling up quickly."');
    lines.push('- **CTA**: [Register now](paramedic.html) → target `/paramedic`');
    lines.push("");
    lines.push("### Programs dropdown links");
    extractLinks(html)
      .filter((l) =>
        ["emergency-medical-responder", "paramedic", "critical-care-transport", "emergency-medical-technician", "community-paramedic", "advanced-tactical-casualty-care", "how-it-works/programs"].some((s) => l.href.includes(s))
      )
      .forEach((l) => lines.push(`- [${l.text}](${l.href})`));
    lines.push("");
    lines.push("### Courses dropdown links");
    extractLinks(html)
      .filter((l) =>
        ["life-support", "cpr", "babysitting", "shooter", "oxygen", "bloodborne", "epinephrine", "how-it-works/couress"].some((s) => l.href.includes(s))
      )
      .forEach((l) => lines.push(`- [${l.text}](${l.href})`));
    lines.push("");
    lines.push("### Testimonial in dropdown (verbatim)");
    lines.push('- Quote: "The hands-on scenarios made a huge difference — I left feeling confident I could actually respond in a real emergency. The instructors were knowledgeable, supportive, and kept the training engaging from start to finish."');
    lines.push('- Attribution: "John Smith, Fire Chief"');
    lines.push("");
    lines.push("### Assets");
    lines.push("- Logo: inline SVG in `div.logo-embed.color` (also `images/Logo.svg`, `images/Logo-wide.svg`)");
  } else if (relPath === "style-guide.html") {
    lines.push("## Purpose: design token reference");
    lines.push("");
    lines.push("Relume Style Guide v3.0 — use to align Tailwind/Relume tokens with Webflow CSS variables in `midwestea.webflow/css/midwestea.css`.");
    lines.push("");
    lines.push("### Sections in Webflow export");
    lines.push("- `#typography` — headings, text sizes/weights/styles, rich text");
    lines.push("- `#colors` — color scheme swatches (color-scheme-1 through color-scheme-10)");
    lines.push("- `#UI-elements` — buttons, tags, forms, icons");
    lines.push("- `#radius` — border radius demos");
    lines.push("- `#effects` — box shadows");
    lines.push("- `#structure-classes` — padding, max-width, margin/spacer utilities");
    lines.push("");
    lines.push("### Migration action");
    lines.push("- Map Webflow `--color-scheme-*` CSS variables to Relume/Tailwind theme in `tailwind.config.ts` and `app/globals.css`");
    lines.push("- Do **not** create a public route for this page");
  } else if (relPath === "untitled.html") {
    lines.push("## Purpose: dev sandbox (not production)");
    lines.push("");
    lines.push("Contains navbar dropdown layout prototypes and alternate mobile menu markup.");
    lines.push("- `div.div-block-2` × 2 — dropdown layout experiments");
    lines.push("- Alternate `div.navigation` with mobile menu");
    lines.push("");
    lines.push("### Migration action");
    lines.push("- Reference only for navigation responsive behavior");
    lines.push("- Do **not** create a route");
  } else if (relPath === "404.html" || relPath === "401.html") {
    const block = html.match(/utility_component[\s\S]*?<\/div>\s*<\/div>/i)?.[0] || html;
    lines.push(`## Component to build: \`components/utility-page.tsx\``);
    lines.push("");
    lines.push(`- **Target route**: ${relPath === "404.html" ? "`/not-found` (Next.js `not-found.tsx`)" : "`/401` or Webflow password page equivalent"}`);
    lines.push("");
    extractHeadings(block).forEach((h) => lines.push(`- h${h.level}: "${h.text}"`));
    extractParagraphs(block).forEach((p) => lines.push(`- "${p}"`));
    extractLinks(block).forEach((l) => {
      if (l.text) lines.push(`- Link: [${l.text}](${l.href})`);
    });
  }

  lines.push("");
  lines.push("## Implementation checklist");
  lines.push("- [ ] Extract markup into shared React component(s)");
  lines.push("- [ ] Wire into `app/layout.tsx` (navigation/footer) or Next.js utility routes");
  lines.push("- [ ] Port assets to `public/`");
  lines.push("- [ ] Verify against Webflow export in browser");
  lines.push("");
  lines.push("## Dependencies / blockers");
  lines.push("- No PageRenderer entry needed unless building a standalone utility page");
  lines.push("");

  return lines.join("\n");
}

function generateDoc(relPath, html) {
  const config = getPageConfig(relPath);
  if (config.route?.startsWith("N/A")) {
    return generateSpecialDoc(relPath, html, config);
  }

  const meta = extractMeta(html);
  const sections = extractSections(html);
  const contentSections = sections.filter((s) => s.action !== "skip-chrome");
  const chromeSections = sections.filter((s) => s.action === "skip-chrome");

  contentSections.forEach((s, i) => (s.index = i + 1));

  const pageTitle = meta.title || path.basename(relPath, ".html");
  const lines = [];

  lines.push(`# ${pageTitle}`);
  lines.push("");
  lines.push("## Source & target");
  lines.push(`- **Webflow file**: \`midwestea.webflow/${relPath}\``);
  lines.push(`- **Target route**: \`${config.route}\``);
  lines.push(`- **Reference template**: \`${config.template}\``);
  if (config.gaps) lines.push(`- **Template gap notes**: ${config.gaps}`);
  lines.push("");

  lines.push("## Page metadata (from `<head>`)");
  if (meta.title) lines.push(`- **title**: ${meta.title}`);
  if (meta.description) lines.push(`- **description**: ${meta.description}`);
  if (meta.ogTitle) lines.push(`- **og:title**: ${meta.ogTitle}`);
  if (meta.ogDescription) lines.push(`- **og:description**: ${meta.ogDescription}`);
  if (meta.ogImage) lines.push(`- **og:image**: ${meta.ogImage}`);
  if (meta.robots) lines.push(`- **robots**: ${meta.robots}`);
  lines.push("");

  lines.push("## Global chrome (excluded from PageRenderer sections)");
  lines.push("- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)");
  lines.push("- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)");
  lines.push("- **Promo banner**: `div.banner` inside navigation");
  if (chromeSections.length) {
    lines.push(`- **Detected in this file at lines**: ${chromeSections.map((s) => s.line).join(", ")}`);
  }
  lines.push("");

  lines.push("## Section map");
  lines.push("");
  lines.push("| # | Webflow selector | Line | Target component | Component file | Action |");
  lines.push("|---|-----------------|------|------------------|----------------|--------|");
  contentSections.forEach((s) => {
    lines.push(`| ${s.index} | \`${s.primaryClass}\` | ~${s.line} | ${s.component} | \`${s.file}\` | ${s.action} |`);
  });
  lines.push("");

  lines.push("## Section content (verbatim extraction)");
  lines.push("");
  contentSections.forEach((s) => {
    lines.push(formatSectionContent(s, html));
    lines.push("");
  });

  // Assets table
  const allImages = [];
  contentSections.forEach((s) => {
    const block = extractBlock(html, s.line);
    extractImages(block).forEach((img) => allImages.push({ ...img, section: s.index }));
  });
  if (allImages.length) {
    lines.push("## Assets");
    lines.push("");
    lines.push("| Webflow src | Alt | Section # |");
    lines.push("|-------------|-----|-----------|");
    const seenSrc = new Set();
    allImages.forEach((img) => {
      if (seenSrc.has(img.src)) return;
      seenSrc.add(img.src);
      lines.push(`| \`${img.src}\` | ${img.alt || "—"} | ${img.section} |`);
    });
    lines.push("");
  }

  const scripts = extractScripts(html);
  lines.push("## Interactions / JS");
  if (scripts.length) {
    scripts.forEach((s) => lines.push(`- ${s}`));
  } else {
    lines.push("- None detected beyond `midwestea.webflow/js/midwestea.js`");
  }
  lines.push("- Global site JS: `midwestea.webflow/js/midwestea.js`");
  lines.push("");

  const slug = relPath.replace(/\.html$/, "").replace(/\//g, "/");
  lines.push("## Implementation checklist");
  if (!config.route.startsWith("N/A")) {
    const appPath =
      relPath === "404.html"
        ? "app/not-found.tsx"
        : relPath === "401.html"
          ? "app/401/page.tsx (or Webflow password equivalent)"
          : `app/${slug}/page.tsx`;
    lines.push(`- [ ] Create route \`${appPath}\` (or dynamic segment as noted)`);
    lines.push(`- [ ] Add/update entry in \`lib/site-config.ts\` with section props`);
  }
  const customSections = contentSections.filter((s) => s.action === "build-custom" || s.action === "extend-component");
  if (customSections.length) {
    lines.push(`- [ ] Build custom component(s): ${[...new Set(customSections.map((s) => s.component))].join(", ")}`);
  }
  lines.push("- [ ] Port assets to `public/`");
  lines.push("- [ ] Verify against Webflow export in browser");
  lines.push("");

  lines.push("## Dependencies / blockers");
  lines.push("- Requires content props system in `PageRenderer` / `site-config.ts`");
  if (html.includes("w-dyn-bind-empty")) lines.push("- CMS-bound fields (`w-dyn-bind-empty`) need data source");
  if (customSections.length) lines.push(`- Custom components required: ${[...new Set(customSections.map((s) => s.component))].join(", ")}`);
  if (config.template === "/program-template") lines.push("- Fix `/program-template` in site-config: add Trainers section between Layout 54 and Layout 493");
  if (["/faq", "/contact", "/policies-list"].includes(config.template)) lines.push("- Fix reference template: replace bare FAQ 6 with FaqHero / ContactSection custom components");
  if (config.template === "/course-template") {
    lines.push("- See [_README.md](_README.md#course-detail-template-shared-by-12-pages) for shared course template structure");
    if (relPath !== "basic-life-support.html") {
      const ref = path.posix.relative(path.dirname(relPath.replace(/\.html$/, ".md")), "basic-life-support") || ".";
      lines.push(`- Cross-reference [basic-life-support.md](${ref === "." ? "basic-life-support.md" : ref + ".md"}) for full template; this page differs in content only`);
    }
  }
  if (config.template === "/program-template" && relPath !== "emergency-medical-responder.html") {
    const ref = path.posix.relative(path.dirname(relPath.replace(/\.html$/, ".md")), "emergency-medical-responder") || ".";
    lines.push(`- Cross-reference [emergency-medical-responder.md](${ref === "." ? "emergency-medical-responder.md" : ref + ".md"}) for full template structure`);
  }
  if (config.template === "/order-confirmation" && relPath !== "purchase-confirmation/general.html") {
    const ref = path.posix.relative(path.dirname(relPath.replace(/\.html$/, ".md")), "purchase-confirmation/general") || ".";
    lines.push(`- Cross-reference [general.md](${ref.includes("/") ? ref + ".md" : "general.md"}) for shared confirmation template`);
  }
  lines.push("");

  return lines.join("\n");
}

function walkHtmlFiles(dir, base = "") {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith(".html")) {
      files.push(rel);
    }
  }
  return files.sort();
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const htmlFiles = walkHtmlFiles(WEBFLOW_DIR);
  console.log(`Generating ${htmlFiles.length} migration docs...`);

  for (const rel of htmlFiles) {
    const html = fs.readFileSync(path.join(WEBFLOW_DIR, rel), "utf8");
    const md = generateDoc(rel, html);
    const outPath = path.join(OUT_DIR, rel.replace(/\.html$/, ".md"));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, md);
    console.log(`  ${rel} → docs/migration/${rel.replace(/\.html$/, ".md")}`);
  }

  console.log("Done.");
}

main();
