import type { StagingStudent } from "@/lib/admin-migrate/students";
import type { StagingClass } from "@/lib/admin-migrate/classes";
import type { AdminTransaction } from "@/app/api/admin/transactions/route";
import type { AdminBasePath } from "@/components/admin-migrate/patterns/client-templates/shared";
import type { PaletteResult, PaletteSection } from "./types";
import {
  DEFAULT_PAGE_IDS,
  PALETTE_PAGES,
  buildActionResults,
  buildPageResult,
  type PaletteActionHandlers,
} from "./paletteActions";
import type { RecentPaletteEntry } from "./recentStorage";
import { recentsToResults } from "./recentStorage";

const MAX_PER_KIND = 5;
const MAX_PAGES = 8;
const PAGE_BASELINE_BOOST = 10;

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function scoreField(needle: string, haystack: string | null | undefined): number {
  if (!needle || !haystack) return 0;
  const h = normalize(haystack);
  if (h === needle) return 100;
  if (h.startsWith(needle)) return 80;
  if (h.includes(needle)) return 50;
  const needleTokens = needle.split(" ");
  const hayTokens = h.split(" ");
  if (needleTokens.every((token) => hayTokens.some((hayToken) => hayToken.startsWith(token)))) return 35;
  return 0;
}

type CompoundView = "settings" | "transactions" | "prerequisites";

const VIEW_KEYWORDS: Record<string, CompoundView> = {
  transactions: "transactions",
  transaction: "transactions",
  invoices: "transactions",
  invoice: "transactions",
  settings: "settings",
  prerequisites: "prerequisites",
  prereqs: "prerequisites",
  prereq: "prerequisites",
};

function detectCompoundClassQuery(
  query: string,
): { baseQuery: string; view: CompoundView } | null {
  const tokens = query.split(" ").filter(Boolean);
  if (tokens.length < 2) return null;
  const last = tokens[tokens.length - 1];
  const view = VIEW_KEYWORDS[last];
  if (!view) return null;
  return { baseQuery: tokens.slice(0, -1).join(" "), view };
}

function classSlug(cls: StagingClass): string {
  return cls.classCode ?? cls.id;
}

function classHref(basePath: AdminBasePath, cls: StagingClass, view?: CompoundView): string {
  const root = `${basePath}/class/${classSlug(cls)}`;
  return view ? `${root}/${view}` : root;
}

function scoreClass(query: string, cls: StagingClass): number {
  return Math.max(
    scoreField(query, cls.classCode),
    scoreField(query, cls.name) * 0.9,
    scoreField(query, cls.courseCode) * 0.5,
  );
}

function scoreStudent(query: string, student: StagingStudent): number {
  return Math.max(scoreField(query, student.name), scoreField(query, student.email) * 0.6);
}

function scoreTransaction(query: string, transaction: AdminTransaction): number {
  const invoiceExact =
    transaction.invoice_number != null && normalize(String(transaction.invoice_number)) === query ? 100 : 0;
  return Math.max(
    scoreField(query, transaction.student_name) * 0.8,
    scoreField(query, transaction.class_id_display) * 0.8,
    invoiceExact,
  );
}

export function flattenSections(sections: PaletteSection[]): PaletteResult[] {
  return sections.flatMap((section) => section.results);
}

export type SearchAllCtx = {
  basePath: AdminBasePath;
  push: (href: string) => void;
  students: StagingStudent[];
  classes: StagingClass[];
  transactions: AdminTransaction[];
  actionHandlers: PaletteActionHandlers;
  recents?: RecentPaletteEntry[];
};

function topScored<T>(
  items: T[],
  score: (item: T) => number,
  toResult: (item: T, score: number) => PaletteResult,
  limit: number,
): PaletteResult[] {
  return items
    .map((item) => ({ item, score: score(item) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => toResult(row.item, row.score));
}

/** Empty-query "root" view: actions + a short curated set of pages, no records. */
function rootSections(ctx: SearchAllCtx): PaletteSection[] {
  const defaultPages = PALETTE_PAGES.filter((page) => DEFAULT_PAGE_IDS.includes(page.id));
  const recentResults = recentsToResults(ctx.recents ?? [], ctx.push, ctx.actionHandlers);
  return [
    ...(recentResults.length > 0 ? [{ heading: "Recent", results: recentResults }] : []),
    { heading: "Actions", results: buildActionResults(ctx.actionHandlers) },
    {
      heading: "Pages",
      results: defaultPages.map((page) => buildPageResult(page, ctx.basePath, ctx.push)),
    },
  ];
}

function classToResult(cls: StagingClass, score: number, ctx: SearchAllCtx, view?: CompoundView): PaletteResult {
  const code = cls.classCode ?? undefined;
  const name = cls.name ?? undefined;
  const viewLabel = view ? `${view[0].toUpperCase()}${view.slice(1)}` : undefined;
  const href = classHref(ctx.basePath, cls, view);
  return {
    id: view ? `class:${cls.id}:${view}` : `class:${cls.id}`,
    kind: "class",
    title: code ?? name ?? "Class",
    subtitle: [name && code ? name : undefined, viewLabel].filter(Boolean).join(" · ") || undefined,
    icon: "class",
    score,
    href,
    onSelect: () => ctx.push(href),
  };
}

export function searchAll(rawQuery: string, ctx: SearchAllCtx): PaletteSection[] {
  const query = normalize(rawQuery);
  if (!query) return rootSections(ctx);

  const compound = detectCompoundClassQuery(query);
  if (compound) {
    const classResults = topScored(
      ctx.classes,
      (cls) => scoreClass(compound.baseQuery, cls),
      (cls, score) => classToResult(cls, score, ctx, compound.view),
      MAX_PER_KIND,
    );
    if (classResults.length > 0) {
      return [{ heading: "Classes", results: classResults }];
    }
    // No class matched the compound form — fall through to normal scoring below.
  }

  const scoredActions = buildActionResults(ctx.actionHandlers)
    .map((result) => ({ ...result, score: scoreField(query, result.title) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);

  const scoredPages = topScored(
    PALETTE_PAGES,
    (page) => {
      const fieldScore = scoreField(query, page.label);
      return fieldScore > 0 ? fieldScore + PAGE_BASELINE_BOOST : 0;
    },
    (page, score) => buildPageResult(page, ctx.basePath, ctx.push, score),
    MAX_PAGES,
  );

  const scoredClasses = topScored(
    ctx.classes,
    (cls) => scoreClass(query, cls),
    (cls, score) => classToResult(cls, score, ctx),
    MAX_PER_KIND,
  );

  const scoredStudents = topScored(
    ctx.students,
    (student) => scoreStudent(query, student),
    (student, score) => {
      const href = `${ctx.basePath}/students/${student.id}`;
      return {
        id: `student:${student.id}`,
        kind: "student",
        title: student.name,
        subtitle: student.email || undefined,
        icon: "student",
        score,
        href,
        onSelect: () => ctx.push(href),
      };
    },
    MAX_PER_KIND,
  );

  const scoredTransactions = topScored(
    ctx.transactions,
    (transaction) => scoreTransaction(query, transaction),
    (transaction, score) => {
      const href = `${ctx.basePath}/transactions?transactionId=${transaction.id}`;
      return {
        id: `transaction:${transaction.id}`,
        kind: "transaction",
        title: transaction.student_name || "Unknown Student",
        subtitle: [
          transaction.invoice_number ? `Invoice ${transaction.invoice_number}` : null,
          transaction.class_id_display,
        ]
          .filter(Boolean)
          .join(" · "),
        icon: "transaction",
        score,
        href,
        onSelect: () => ctx.push(href),
      };
    },
    MAX_PER_KIND,
  );

  return [
    { heading: "Actions", results: scoredActions },
    { heading: "Pages", results: scoredPages },
    { heading: "Classes", results: scoredClasses },
    { heading: "Students", results: scoredStudents },
    { heading: "Transactions", results: scoredTransactions },
  ].filter((section) => section.results.length > 0);
}
