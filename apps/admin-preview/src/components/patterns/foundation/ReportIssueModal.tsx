"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bug, Lightbulb } from "lucide-react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";

export type ReportIssueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Active top-level nav label (e.g. "Businesses") — desktop pages don't render an <h1>. */
  sectionLabel?: string;
};

type IssueType = "bug" | "feature";

type PageContext = {
  /** e.g. "Businesses > Sponsors" — page heading plus any active `role="tab"` selections. */
  breadcrumb: string;
  panelOpen: boolean;
  /** First ~100 chars of the open detail panel's text, for a hint at what was selected. */
  panelPreview: string;
};

/**
 * Best-effort snapshot of "where the user is" beyond the URL: tab/filter and detail-panel
 * selection in this app live in local React state, not query params, so we read it back out
 * of the DOM via the shared `ViewTab` (`role="tab"`/`aria-selected`) and `OutlinedPanel`
 * (`role="complementary"`) conventions used across every admin-migrate page. `sectionLabel`
 * (the active sidebar nav item) covers the top level, since desktop pages don't render an <h1>.
 */
function capturePageContext(sectionLabel?: string): PageContext {
  if (typeof document === "undefined") {
    return { breadcrumb: sectionLabel ?? "", panelOpen: false, panelPreview: "" };
  }
  const activeTabs = Array.from(
    document.querySelectorAll('[role="tab"][aria-selected="true"]'),
  )
    .map((el) => el.textContent?.trim())
    .filter((label): label is string => Boolean(label));
  const breadcrumb = [sectionLabel, ...activeTabs].filter(Boolean).join(" > ");

  const panel = document.querySelector('[role="complementary"]');
  const panelPreview = panel?.textContent?.replace(/\s+/g, " ").trim().slice(0, 100) ?? "";

  return { breadcrumb, panelOpen: Boolean(panel), panelPreview };
}

const typeCopy: Record<IssueType, { title: string; placeholder: string; submitLabel: string }> = {
  bug: {
    title: "Report a bug",
    placeholder: "What happened? What did you expect instead?",
    submitLabel: "Report bug",
  },
  feature: {
    title: "Request a feature",
    placeholder: "What would you like to see?",
    submitLabel: "Request feature",
  },
};

/** In the full app, sends a bug report or feature request to Linear. Disabled in this demo export. */
export function ReportIssueModal({ isOpen, onClose, sectionLabel }: ReportIssueModalProps) {
  const [type, setType] = useState<IssueType>("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageContext, setPageContext] = useState<PageContext>({
    breadcrumb: "",
    panelOpen: false,
    panelPreview: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setType("bug");
    setTitle("");
    setDescription("");
    setIsSubmitting(false);
    // Capture before the modal's own overlay/content mount so this reflects the page underneath.
    setPageContext(capturePageContext(sectionLabel));
  }, [isOpen, sectionLabel]);

  async function handleSubmit() {
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    // This export has no backend — Linear reporting is disabled, not wired to a stub endpoint.
    toast.success("Noted — issue reporting isn't wired up in this demo export.");
    setIsSubmitting(false);
    onClose();
  }

  const copy = typeCopy[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={copy.title}
      width={440}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={isSubmitting} />
          <Button
            label={isSubmitting ? "Sending…" : copy.submitLabel}
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            label="Bug"
            icon={<Bug size={14} strokeWidth={1.75} />}
            variant={type === "bug" ? "primary" : "secondary"}
            onClick={() => setType("bug")}
          />
          <Button
            label="Feature"
            icon={<Lightbulb size={14} strokeWidth={1.75} />}
            variant={type === "feature" ? "primary" : "secondary"}
            onClick={() => setType("feature")}
          />
        </div>
        <TextInput label="Title" value={title} onChange={setTitle} />
        <TextInput
          label="Description"
          value={description}
          onChange={setDescription}
          multiline
          rows={4}
        />
        {pageContext.breadcrumb || pageContext.panelOpen ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Text size="sm" color="secondary">
              Attached context
            </Text>
            <Text size="sm" color="disabled">
              {pageContext.breadcrumb || "Unknown page"}
              {pageContext.panelOpen
                ? ` · panel open${pageContext.panelPreview ? `: "${pageContext.panelPreview}"` : ""}`
                : ""}
            </Text>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
