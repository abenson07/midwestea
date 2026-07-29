"use client";

import { Button } from "@/components/patterns/primitives/Button";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { CalendarDays, FileText } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { StudentCertificateRow, StudentDocumentRow } from "@/data/mocks/student-detail";

export type DocumentDetailPanelProps = {
  document: StudentCertificateRow | StudentDocumentRow;
};

function isCertificate(
  document: StudentCertificateRow | StudentDocumentRow,
): document is StudentCertificateRow {
  return "issuedDate" in document;
}

/**
 * Certificate / document detail — shown in the outlined side panel when a
 * row is selected from the Documents tab's certificate or document table.
 */
export function DocumentDetailPanel({ document }: DocumentDetailPanelProps) {
  const certificate = isCertificate(document) ? document : null;

  return (
    <VStack gap={5}>
      <Text weight="medium">{document.name}</Text>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Details
          </Text>
        }
      >
        <SideContentField icon={<FileText size={16} strokeWidth={1.75} />} label={document.name} />
        {certificate ? (
          <>
            <SideContentField
              icon={<CalendarDays size={16} strokeWidth={1.75} />}
              label={`Issued ${certificate.issuedDate}`}
            />
            <SideContentField
              icon={<CalendarDays size={16} strokeWidth={1.75} />}
              label={`Expires ${certificate.expiresDate}`}
            />
          </>
        ) : (
          <SideContentField
            icon={<CalendarDays size={16} strokeWidth={1.75} />}
            label={`Uploaded ${(document as StudentDocumentRow).uploadedAt}`}
          />
        )}
      </List>

      <Button label="View file" variant="secondary" size="sm" width="100%" />
    </VStack>
  );
}
