import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { CompletionCertificateDocument } from "./completion-certificate";
import type { CompletionCertificateProps } from "./types";

export async function renderCompletionCertificatePdf(
  props: CompletionCertificateProps,
): Promise<Blob> {
  const document = createElement(
    CompletionCertificateDocument,
    props,
  ) as unknown as ReactElement<DocumentProps>;
  return pdf(document).toBlob();
}
