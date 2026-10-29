"use client";

import { useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { createSupabaseClient } from "@midwestea/utils";
import { updateStudent, deleteStudent } from "@/lib/students";
import { Card } from "@/components/admin-migrate/patterns/primitives/Card";
import { Heading, Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { VStack } from "@/components/admin-migrate/patterns/primitives/Stack";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { Switch } from "@/components/admin-migrate/patterns/primitives/Switch";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { SettingsRow } from "@/components/admin-migrate/patterns/settings/SettingsRow";
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
  // Last values the server confirmed; the form is "dirty" relative to this.
  const [baseline, setBaseline] = useState(student);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function patch(next: Partial<StudentRecord>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  /** Best-effort audit entry, same as the old admin; never fails the save. */
  async function logChanges(changes: Array<{ field_name: string; old_value: string | null; new_value: string | null }>) {
    if (changes.length === 0) return;
    try {
      const supabase = await createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const basePath = window.location.pathname.startsWith("/app") ? "/app" : "";
      await fetch(`${basePath}/api/logs/detail-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          reference_id: draft.id,
          reference_type: "student",
          field_changes: changes,
          batch_id: crypto.randomUUID(),
        }),
      });
    } catch (logError) {
      console.error("Failed to log student changes:", logError);
    }
  }

  async function handleSave() {
    if (saving || deleting) return;
    const name = draft.name.trim();
    const email = draft.email.trim();
    if (!name) {
      toast.error("Full name is required");
      return;
    }
    if (email !== baseline.email.trim() && !email) {
      toast.error("Email cannot be removed. Enter a valid email address.");
      return;
    }

    // Send only what changed (undefined = skip), so untouched fields and the
    // auth email are never rewritten.
    const changed = <K extends keyof StudentRecord>(key: K, value: StudentRecord[K]) =>
      value !== baseline[key] ? value : undefined;
    const nameChange = name !== baseline.name ? name : undefined;
    const emailChange = email !== baseline.email.trim() ? email : undefined;
    const phoneChange = changed("phone", draft.phone);
    const tshirtChange = changed("tshirtSize", draft.tshirtSize);
    const ecNameChange = changed("emergencyContactName", draft.emergencyContactName);
    const ecPhoneChange = changed("emergencyContactPhone", draft.emergencyContactPhone);
    const reqChange = changed("hasRequiredInfo", draft.hasRequiredInfo);

    const fieldChanges: Array<{ field_name: string; old_value: string | null; new_value: string | null }> = [];
    const track = (field: string, from: string | boolean, to: string | boolean | undefined) => {
      if (to === undefined) return;
      fieldChanges.push({ field_name: field, old_value: String(from), new_value: String(to) });
    };
    track("full_name", baseline.name, nameChange);
    track("email", baseline.email, emailChange);
    track("phone", baseline.phone, phoneChange);
    track("t_shirt_size", baseline.tshirtSize, tshirtChange);
    track("emergency_contact_name", baseline.emergencyContactName, ecNameChange);
    track("emergency_contact_phone", baseline.emergencyContactPhone, ecPhoneChange);
    track("has_required_info", baseline.hasRequiredInfo, reqChange);

    if (fieldChanges.length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const { success, error } = await updateStudent(
        draft.id,
        nameChange,
        phoneChange,
        tshirtChange,
        ecNameChange,
        ecPhoneChange,
        reqChange,
        emailChange
      );
      if (!success) {
        toast.error(`Failed to save student details: ${error ?? "Unknown error"}`);
        return;
      }
      setBaseline({ ...draft, name, email });
      setDraft((prev) => ({ ...prev, name, email }));
      toast.success("Student details saved");
      void logChanges(fieldChanges);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      const { success, error } = await deleteStudent(draft.id);
      if (!success) {
        toast.error(`Failed to delete student: ${error ?? "Unknown error"}`);
        return;
      }
      setDeleteOpen(false);
      toast.success(`${baseline.name} removed and login blocked`);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
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
            disabled={saving || deleting}
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
              description="Hides the student from the admin and blocks their login. All records (enrollments, invoices, payments and history) are kept."
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
        onClose={() => (deleting ? undefined : setDeleteOpen(false))}
        title={`Delete ${draft.name}?`}
        width={440}
        footer={
          <>
            <Button label="Cancel" variant="ghost" disabled={deleting} onClick={() => setDeleteOpen(false)} />
            <Button
              label={deleting ? "Deleting…" : "Delete student"}
              variant="primary"
              disabled={deleting}
              onClick={() => void handleDelete()}
            />
          </>
        }
      >
        <Text size="sm" color="secondary">
          This hides {draft.name} from the admin and blocks their login. All of their records (enrollments, invoices, payments and history) are kept.
        </Text>
      </Modal>
    </div>
  );
}
