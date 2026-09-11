/**
 * Standalone entry point for rendering a certificate PDF outside Next's
 * webpack/RSC module graph. Invoked via `tsx` as a child process by
 * render.ts — see the comment there for why this process boundary exists.
 * Not imported anywhere in the app; only ever run directly.
 */
import { writeFile } from "node:fs/promises";
import { createElement } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { CompletionCertificateDocument } from "./completion-certificate";
import type { CompletionCertificateProps } from "./types";

async function main() {
  const [, , propsPath, outputPath] = process.argv;
  if (!propsPath || !outputPath) {
    throw new Error("Usage: render-worker.ts <props.json path> <output.pdf path>");
  }

  const { readFile } = await import("node:fs/promises");
  const props: CompletionCertificateProps = JSON.parse(await readFile(propsPath, "utf8"));

  const document = createElement(
    CompletionCertificateDocument,
    props,
  ) as unknown as ReturnType<typeof createElement<DocumentProps>>;

  const blob = await pdf(document as any).toBlob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  await writeFile(outputPath, buffer);
}

main().catch((error) => {
  console.error("[render-worker] failed:", error?.stack || error);
  process.exit(1);
});
