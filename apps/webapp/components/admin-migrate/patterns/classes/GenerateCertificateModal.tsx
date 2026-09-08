"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { Checkbox } from "@/components/admin-migrate/patterns/primitives/Checkbox";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { getSession } from "@/lib/auth";
import { todayIsoDate } from "@/lib/dates";

export type CertificateTarget = {
  enrollmentId: string;
  studentId: string;
  studentName: string;
};

export type GenerateCertificateResult = {
  enrollmentId: string;
  success: boolean;
  error?: string;
};

export type GenerateCertificateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  /** Pre-filled from the class/course's certification_length — the admin confirms or edits it. */
  defaultDurationYears?: number | null;
  targets: CertificateTarget[];
  onIssued: (results: GenerateCertificateResult[]) => void;
};

const fieldStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

export function GenerateCertificateModal({
  isOpen,
  onClose,
  className,
  defaultDurationYears,
  targets,
  onIssued,
}: GenerateCertificateModalProps) {
  const [issuedAt, setIssuedAt] = useState(todayIsoDate());
  const [durationYears, setDurationYears] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setIssuedAt(todayIsoDate());
    setDurationYears(defaultDurationYears != null ? String(defaultDurationYears) : "");
    setSelectedIds(new Set(targets.map((target) => target.enrollmentId)));
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset fields once per open, not on every targets/defaultDurationYears identity change
  }, [isOpen]);

  const isBulk = targets.length > 1;
  const selectedTargets = isBulk ? targets.filter((target) => selectedIds.has(target.enrollmentId)) : targets;
  const title = isBulk
    ? `Generate ${selectedTargets.length} certificate${selectedTargets.length === 1 ? "" : "s"}`
    : `Generate certificate`;

  function toggleTarget(enrollmentId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(enrollmentId)) next.delete(enrollmentId);
      else next.add(enrollmentId);
      return next;
    });
  }

  async function handleConfirm() {
    if (selectedTargets.length === 0) return;

    const durationValue = durationYears.trim() === "" ? null : Number(durationYears);
    if (durationValue != null && !Number.isFinite(durationValue)) {
      setError("Duration must be a number");
      return;
    }
    if (!issuedAt) {
      setError("Enter a date of issuance");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { session } = await getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch("/api/admin/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          enrollmentIds: selectedTargets.map((target) => target.enrollmentId),
          issuedAt,
          durationYearsOverride: durationValue,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error || "Failed to generate certificates");
      }

      const results = (body?.results ?? []) as GenerateCertificateResult[];
      const failed = results.filter((row) => !row.success);
      onIssued(results);
      onClose();

      if (failed.length === 0) {
        toast.success(isBulk ? `Generated ${results.length} certificates` : "Certificate generated");
      } else if (failed.length === results.length) {
        toast.error(failed[0]?.error || "Failed to generate certificates");
      } else {
        toast.warning(`Generated ${results.length - failed.length} of ${results.length} certificates`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate certificates");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={440}
      maxHeightVh={80}
      footer={
        <>
          <Button label="Cancel" variant="ghost" onClick={onClose} disabled={submitting} />
          <Button
            label={submitting ? "Generating…" : title}
            variant="primary"
            disabled={submitting || selectedTargets.length === 0}
            onClick={handleConfirm}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Text size="sm" color="secondary">
          {isBulk ? (
            <>
              Select which students to generate certificates for in {className}. This marks each
              selected student as Graduated for this class.
            </>
          ) : (
            <>
              Generate a certificate for{" "}
              <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>
                {targets[0]?.studentName}
              </span>{" "}
              in {className}. This marks them as Graduated for this class.
            </>
          )}
        </Text>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <Text size="sm" color="secondary">
              Date of issuance
            </Text>
            <input
              type="date"
              value={issuedAt}
              onChange={(event) => setIssuedAt(event.target.value)}
              style={fieldStyle}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <Text size="sm" color="secondary">
              Valid for (years)
            </Text>
            <input
              type="number"
              min="0"
              step="1"
              value={durationYears}
              onChange={(event) => setDurationYears(event.target.value)}
              placeholder="No expiry"
              style={fieldStyle}
            />
          </div>
        </div>
        <Text size="sm" color="secondary" style={{ marginTop: -10 }}>
          Duration is pre-filled from the class's certification length — confirm or edit before generating.
        </Text>

        {isBulk ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Text size="sm" color="secondary">
              Students ({selectedTargets.length} of {targets.length} selected)
            </Text>
            <div
              style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: 8,
                borderRadius: 6,
                border: "var(--linear-border-width) solid var(--linear-color-hairline)",
              }}
            >
              {targets.map((target) => (
                <div
                  key={target.enrollmentId}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleTarget(target.enrollmentId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleTarget(target.enrollmentId);
                    }
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = "var(--linear-color-sidebar-item-selected)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                  }}
                  style={{
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: "transparent",
                    transition: "background 0.1s ease",
                  }}
                >
                  {/* No onChange here on purpose — the row's onClick above owns the toggle,
                      and the click still bubbles up from this checkbox to trigger it. */}
                  <Checkbox label={target.studentName} value={selectedIds.has(target.enrollmentId)} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <Text size="sm" color="secondary" style={{ color: "#eb5757" }}>
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}
