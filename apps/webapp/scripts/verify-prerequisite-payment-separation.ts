import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Direction A -- prerequisite logic must not read payment state.
const DIRECTION_A_FILES = [
  "../lib/prerequisite-evaluation.ts",
  "../lib/class-access.ts",
  "../lib/student-credentials.ts",
  "../lib/class-prerequisites.ts",
  "../lib/admin-prerequisites.ts",
];

const DIRECTION_A_TERMS = [
  "transaction",
  "payment",
  "amount_due",
  "amount_paid",
  "balance",
  "invoice",
  "stripe",
];

// Direction B -- payment logic must not read prerequisite state.
const DIRECTION_B_FILES = [
  "../lib/invoices.ts",
  "../lib/invoice-payments.ts",
  "../lib/stripe-invoices.ts",
  "../lib/student-billing.ts",
  "../lib/payments.ts",
];

const DIRECTION_B_TERMS = ["prerequisite", "student_credentials", "class_prerequisites", "review_status"];

// Direction C (BEN-872) -- prerequisite code may never WRITE removal or
// refund fields. It may legitimately READ enrollment_status to exclude
// removed students (assertClassMaterialAccess, getClassPrerequisiteMatrix,
// getFollowUpRows, getStudentClassPrerequisiteSummaries all do this), so
// this rule only flags identifiers found inside a .update(/.insert(/
// .upsert(/.delete( call, never a bare read.
const DIRECTION_C_STATIC_FILES = DIRECTION_A_FILES;
const DIRECTION_C_API_DIRS = ["../app/api/prerequisites", "../app/api/admin/prerequisites"];

const DIRECTION_C_TERMS = ["enrollment_status", "refund_percentage", "refund_amount", "transaction_status"];

const WRITE_CALL_PATTERN = /\.(update|insert|upsert|delete)\(/g;

/**
 * Strips // line comments and /* block comments *\/ so an explanatory
 * comment (e.g. "never reads payment state") does not trip the check.
 * Deliberately does not try to be a full tokenizer -- good enough for
 * greppable, non-adversarial source files.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");
}

interface Violation {
  file: string;
  term: string;
}

function checkFiles(relativeFiles: string[], forbiddenTerms: string[]): Violation[] {
  const violations: Violation[] = [];

  for (const relativeFile of relativeFiles) {
    const absolutePath = path.resolve(__dirname, relativeFile);
    let source: string;
    try {
      source = readFileSync(absolutePath, "utf8");
    } catch {
      // A file that doesn't exist yet has nothing to violate.
      continue;
    }

    const cleaned = stripComments(source).toLowerCase();

    for (const term of forbiddenTerms) {
      if (cleaned.includes(term.toLowerCase())) {
        violations.push({ file: relativeFile, term });
      }
    }
  }

  return violations;
}

/**
 * Finds the index of the close paren matching the open paren at
 * `openIndex` (which must point at the '(' character).
 */
function findMatchingCloseParen(text: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1; // Unbalanced -- treat as "rest of file" by the caller.
}

/**
 * Write-only detection (BEN-872 direction C): flags a forbidden identifier
 * only when it appears inside the argument list of a .update(/.insert(/
 * .upsert(/.delete( call, never in a bare read such as
 * .eq('enrollment_status', 'removed') or .neq(...).
 */
function checkWriteCalls(relativeFile: string, forbiddenTerms: string[]): Violation[] {
  const violations: Violation[] = [];
  const absolutePath = path.resolve(__dirname, relativeFile);

  let source: string;
  try {
    source = readFileSync(absolutePath, "utf8");
  } catch {
    return violations;
  }

  const cleaned = stripComments(source);
  const flaggedTerms = new Set<string>();

  let match: RegExpExecArray | null;
  const pattern = new RegExp(WRITE_CALL_PATTERN);
  while ((match = pattern.exec(cleaned)) !== null) {
    const openParenIndex = match.index + match[0].length - 1;
    let closeParenIndex = findMatchingCloseParen(cleaned, openParenIndex);
    if (closeParenIndex === -1) closeParenIndex = cleaned.length - 1;

    const callArgs = cleaned.slice(openParenIndex, closeParenIndex + 1).toLowerCase();

    for (const term of forbiddenTerms) {
      if (!flaggedTerms.has(term) && callArgs.includes(term.toLowerCase())) {
        flaggedTerms.add(term);
      }
    }
  }

  for (const term of flaggedTerms) {
    violations.push({ file: relativeFile, term });
  }

  return violations;
}

/** All .ts files under a directory, recursively. */
function listTsFilesRecursive(relativeDir: string): string[] {
  const absoluteDir = path.resolve(__dirname, relativeDir);
  const results: string[] = [];

  function walk(dir: string) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith(".ts")) {
        results.push(path.relative(__dirname, fullPath));
      }
    }
  }

  walk(absoluteDir);
  return results;
}

function main() {
  const directionCFiles = [
    ...DIRECTION_C_STATIC_FILES,
    ...DIRECTION_C_API_DIRS.flatMap((dir) => listTsFilesRecursive(dir)),
  ];

  const violations = [
    ...checkFiles(DIRECTION_A_FILES, DIRECTION_A_TERMS),
    ...checkFiles(DIRECTION_B_FILES, DIRECTION_B_TERMS),
    ...directionCFiles.flatMap((file) => checkWriteCalls(file, DIRECTION_C_TERMS)),
  ];

  if (violations.length > 0) {
    console.error("Prerequisite separation check failed.");
    for (const violation of violations) {
      console.error(`${violation.file}: forbidden reference to "${violation.term}"`);
    }
    process.exit(1);
  }

  const totalFiles = new Set([...DIRECTION_A_FILES, ...DIRECTION_B_FILES, ...directionCFiles]).size;
  console.log(`Verified prerequisite separation from payment and removal workflows across ${totalFiles} files.`);
}

main();
