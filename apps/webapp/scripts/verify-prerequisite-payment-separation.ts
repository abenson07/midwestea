import { readFileSync } from "fs";
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

function main() {
  const violations = [
    ...checkFiles(DIRECTION_A_FILES, DIRECTION_A_TERMS),
    ...checkFiles(DIRECTION_B_FILES, DIRECTION_B_TERMS),
  ];

  if (violations.length > 0) {
    console.error("Prerequisite/payment separation check failed.");
    for (const violation of violations) {
      console.error(`${violation.file}: forbidden reference to "${violation.term}"`);
    }
    process.exit(1);
  }

  const totalFiles = DIRECTION_A_FILES.length + DIRECTION_B_FILES.length;
  console.log(`Verified prerequisite/payment separation across ${totalFiles} files.`);
}

main();
