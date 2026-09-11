import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { CompletionCertificateProps } from "./types";

const execFileAsync = promisify(execFile);

/**
 * Renders in a standalone `tsx` child process rather than in-process.
 * Next's RSC webpack layer resolves `react` to a different module instance
 * than the one @react-pdf/renderer's reconciler uses (even with it in
 * serverExternalPackages), so React elements built in-process fail the
 * reconciler's element-identity check with "Minified React error #31".
 * A separate process uses Node's plain module resolution end-to-end, which
 * is the same setup already confirmed to render correctly.
 */
export async function renderCompletionCertificatePdf(
  props: CompletionCertificateProps,
): Promise<Blob> {
  const dir = await mkdtemp(join(tmpdir(), "certificate-"));
  const propsPath = join(dir, "props.json");
  const outputPath = join(dir, "certificate.pdf");
  try {
    await writeFile(propsPath, JSON.stringify(props));
    const workerPath = join(process.cwd(), "lib/certificates/render-worker.ts");
    await execFileAsync("npx", ["--yes", "tsx@4", workerPath, propsPath, outputPath], {
      cwd: process.cwd(),
    });
    const buffer = await readFile(outputPath);
    return new Blob([buffer], { type: "application/pdf" });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
