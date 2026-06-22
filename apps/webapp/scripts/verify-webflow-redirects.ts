import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Redirect } from "next/dist/lib/load-custom-routes";
import { WEBFLOW_HOMEPAGE_IMPROVEMENTS, webflowCartRedirects, webflowPathRedirects } from "../lib/marketing/webflow-redirects";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type CsvRow = {
  sourcePath: string;
  cartId?: string;
  expectedDestination: string;
};

function parseSource(source: string): { sourcePath: string; cartId?: string } {
  const [sourcePath, query = ""] = source.split("?");
  if (!query) {
    return { sourcePath };
  }

  const params = new URLSearchParams(query);
  const cartId = params.get("add-to-cart") ?? undefined;
  return { sourcePath, cartId };
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv.trim().split("\n").slice(1);
  return lines.map((line) => {
    const [source, target] = line.split(",");
    const { sourcePath, cartId } = parseSource(source);
    return {
      sourcePath,
      cartId,
      expectedDestination: WEBFLOW_HOMEPAGE_IMPROVEMENTS[sourcePath] ?? target,
    };
  });
}

function redirectKey(sourcePath: string, cartId?: string): string {
  return cartId ? `${sourcePath}?add-to-cart=${cartId}` : sourcePath;
}

function buildRedirectLookup(redirects: Redirect[]): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const redirect of redirects) {
    if ("has" in redirect && redirect.has) {
      const cartRule = redirect.has.find(
        (rule) => rule.type === "query" && rule.key === "add-to-cart" && typeof rule.value === "string",
      );
      if (cartRule && typeof cartRule.value === "string") {
        lookup.set(redirectKey(redirect.source, cartRule.value), redirect.destination);
      }
      continue;
    }

    lookup.set(redirect.source, redirect.destination);
  }

  return lookup;
}

function main() {
  const csvPath = path.resolve(__dirname, "../lib/marketing/webflow-redirects.csv");
  const csv = readFileSync(csvPath, "utf8");
  const rows = parseCsv(csv);
  const redirects = [...webflowCartRedirects, ...webflowPathRedirects];
  const lookup = buildRedirectLookup(redirects);

  const missing: string[] = [];
  const mismatched: string[] = [];

  for (const row of rows) {
    const key = redirectKey(row.sourcePath, row.cartId);
    let actual = lookup.get(key);

    if (!actual && !row.cartId) {
      actual = lookup.get(row.sourcePath);
    }

    if (!actual && !row.cartId && /^\/shop\/page\/\d+$/.test(row.sourcePath)) {
      actual = lookup.get("/shop/page/:page");
    }

    if (!actual) {
      missing.push(key);
      continue;
    }

    if (actual !== row.expectedDestination) {
      mismatched.push(`${key}: expected ${row.expectedDestination}, got ${actual}`);
    }
  }

  if (missing.length > 0 || mismatched.length > 0) {
    console.error("Webflow redirect verification failed.");
    if (missing.length > 0) {
      console.error(`Missing rules (${missing.length}):`);
      for (const item of missing) {
        console.error(`  - ${item}`);
      }
    }
    if (mismatched.length > 0) {
      console.error(`Mismatched destinations (${mismatched.length}):`);
      for (const item of mismatched) {
        console.error(`  - ${item}`);
      }
    }
    process.exit(1);
  }

  console.log(`Verified ${rows.length} Webflow redirect rules against CSV.`);
}

main();
