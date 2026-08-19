"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { Modal } from "@/components/patterns/shared/Modal";
import { ClassSidebarSection } from "../classes/ClassSidebarSection";
import type { StudentDocument } from "./types";

export type StudentDocumentsCardProps = {
  documents: StudentDocument[];
};

/** Uploaded files and issued certificates — click opens a PDF viewer. */
export function StudentDocumentsCard({ documents }: StudentDocumentsCardProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = documents.find((doc) => doc.id === openId) ?? null;

  return (
    <>
      <ClassSidebarSection title="Documents">
        {documents.length ? (
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(doc.id)}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <FileText
                    size={14}
                    strokeWidth={1.75}
                    style={{
                      color: "var(--linear-color-ink-subtle)",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <Text size="sm" style={{ color: "var(--linear-color-accent)" }}>
                      {doc.name}
                    </Text>
                    <Text size="sm" color="secondary">
                      {doc.kind === "issued" ? "Issued" : "Uploaded"}
                      {doc.date ? ` · ${doc.date}` : ""}
                    </Text>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <Text size="sm" color="secondary">
            No documents yet.
          </Text>
        )}
      </ClassSidebarSection>
      <Modal
        isOpen={selected != null}
        onClose={() => setOpenId(null)}
        title={selected?.name ?? "Document"}
        fullScreenInset={64}
      >
        {selected ? (
          <iframe
            src={`${selected.href}#toolbar=0&navpanes=0`}
            title={selected.name}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : null}
      </Modal>
    </>
  );
}
