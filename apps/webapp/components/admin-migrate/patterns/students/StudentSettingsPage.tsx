"use client";

import { useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { Switch } from "@/components/patterns/primitives/Switch";
import { Modal } from "@/components/patterns/shared/Modal";
import { SettingsRow } from "@/components/patterns/client-templates-migrate/settings/SettingsRow";
import type { StudentRecord } from "./types";

const rowInputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: 260,
  height: 30,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
  textAlign: "right",
};

const lockedValueStyle: CSSProperties = {
  boxSizing: "border-box",
  width: 260,
  textAlign: "right",
};

function Divider() {
  return <div style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }} />;
}

export type StudentSettingsPageProps = {
  student: StudentRecord;
  onDeleted?: () => void;
};

/** Student settings — personal fields plus a permanent delete. */
export function StudentSettingsPage({ student, onDeleted }: StudentSettingsPageProps) {
  const [draft, setDraft] = useState(student);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function patch(next: Partial<StudentRecord>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSaving(false);
    toast.success("Student details saved — demo mode, saved locally only");
  }

  function handleDelete() {
    setDeleteOpen(false);
    toast.success(`${draft.name} deleted — demo mode, not removed from the list`);
    onDeleted?.();
  }

  return (
    <div style={{ maxWidth: 760, marginInline: "auto", padding: "48px 24px 64px" }}>
      <VStack gap={8}>
        <Heading level={1}>Student settings</Heading>

        <VStack gap={3}>
          <Text type="label" color="secondary">
            Personal details
          </Text>
          <Card padding={4}>
            <VStack gap={4}>
              <SettingsRow
                label="Full name"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.name}
                    aria-label="Full name"
                    onChange={(event) => patch({ name: event.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Email"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.email}
                    aria-label="Email"
                    onChange={(event) => patch({ email: event.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Phone"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.phone}
                    aria-label="Phone"
                    onChange={(event) => patch({ phone: event.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="T-shirt size"
                control={
                  <select
                    style={{ ...rowInputStyle, textAlign: "left" }}
                    value={draft.tshirtSize}
                    aria-label="T-shirt size"
                    onChange={(event) => patch({ tshirtSize: event.target.value })}
                  >
                    {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                }
              />
              <Divider />
              <SettingsRow
                label="Emergency contact"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.emergencyContactName}
                    aria-label="Emergency contact"
                    onChange={(event) => patch({ emergencyContactName: event.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Emergency phone"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.emergencyContactPhone}
                    aria-label="Emergency phone"
                    onChange={(event) => patch({ emergencyContactPhone: event.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Has required info"
                control={
                  <Switch
                    label="Has required info"
                    isLabelHidden
                    value={draft.hasRequiredInfo}
                    onChange={(hasRequiredInfo) => patch({ hasRequiredInfo })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Stripe customer ID"
                description="Assigned when the student is created"
                control={<Text style={lockedValueStyle}>{draft.stripeCustomerId}</Text>}
              />
            </VStack>
          </Card>
        </VStack>

        <div>
          <Button
            label={saving ? "Saving…" : "Save changes"}
            variant="primary"
            disabled={saving}
            onClick={() => void handleSave()}
          />
        </div>

        <VStack gap={3}>
          <Text type="label" color="secondary">
            Danger zone
          </Text>
          <Card padding={4}>
            <SettingsRow
              label="Delete student"
              description="Permanently removes the student record. This cannot be undone."
              control={
                <Button
                  label="Delete student"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                />
              }
            />
          </Card>
        </VStack>
      </VStack>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Delete ${draft.name}?`}
        width={440}
        footer={
          <>
            <Button label="Cancel" variant="ghost" onClick={() => setDeleteOpen(false)} />
            <Button label="Delete student" variant="primary" onClick={handleDelete} />
          </>
        }
      >
        <Text size="sm" color="secondary">
          This permanently removes {draft.name} and their auth account. It cannot be undone.
        </Text>
      </Modal>
    </div>
  );
}
