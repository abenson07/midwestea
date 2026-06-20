#!/usr/bin/env node
/**
 * Resolve a page name to migration doc + Webflow source paths.
 * Usage: node scripts/resolve-migration-page.mjs about
 *        node scripts/resolve-migration-page.mjs "basic life support"
 *        node scripts/resolve-migration-page.mjs purchase-confirmation/bls
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MIGRATION_DIR = path.join(ROOT, "docs", "migration");
const WEBFLOW_DIR = path.join(ROOT, "midwestea.webflow");

const query = process.argv.slice(2).join(" ").trim().toLowerCase();
if (!query) {
  console.error("Usage: node scripts/resolve-migration-page.mjs <page-name>");
  process.exit(1);
}

function walkMdFiles(dir, base = "") {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...walkMdFiles(path.join(dir, entry.name), rel));
    else if (entry.name.endsWith(".md") && entry.name !== "_README.md" && entry.name !== "DOC-TEMPLATE.md") {
      files.push(rel.replace(/\.md$/, ""));
    }
  }
  return files;
}

const pages = walkMdFiles(MIGRATION_DIR);
const normalized = query.replace(/\s+/g, "-").replace(/_/g, "-");

const scored = pages.map((slug) => {
  const s = slug.toLowerCase();
  const base = path.basename(s);
  let score = 0;
  if (s === normalized || base === normalized) score = 100;
  else if (s.endsWith(`/${normalized}`) || s.includes(normalized)) score = 80;
  else if (base.includes(normalized) || normalized.includes(base)) score = 60;
  else if (normalized.split("-").every((part) => s.includes(part))) score = 40;
  return { slug, score };
});

scored.sort((a, b) => b.score - a.score);
const best = scored[0];

if (!best || best.score === 0) {
  console.error(`No migration doc found for "${query}".`);
  console.error("\nAvailable pages:");
  pages.sort().forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

const migrationDoc = path.join(MIGRATION_DIR, `${best.slug}.md`);
const webflowHtml = path.join(WEBFLOW_DIR, `${best.slug}.html`);

console.log(JSON.stringify({
  query,
  slug: best.slug,
  migrationDoc: `docs/migration/${best.slug}.md`,
  webflowHtml: `midwestea.webflow/${best.slug}.html`,
  migrationDocExists: fs.existsSync(migrationDoc),
  webflowHtmlExists: fs.existsSync(webflowHtml),
  score: best.score,
  alternates: scored.filter((s) => s.score > 0 && s.slug !== best.slug).slice(0, 5).map((s) => s.slug),
}, null, 2));
