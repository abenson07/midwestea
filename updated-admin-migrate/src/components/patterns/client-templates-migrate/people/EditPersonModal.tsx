"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";
import { validateEmail, validatePhone } from "@/lib/validation";
import type { PersonWithMembership } from "hooks";
import type { PeopleUpdate, MembershipsUpdate } from "@/types/database";

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;
const selectStyle = {
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

const MEMBERSHIP_TIERS = ["household", "individual", "senior", "student"];
const MEMBERSHIP_STATUSES = ["active", "pending", "past_due", "lapsed"];

export type EditPersonModalProps = {
  isOpen: boolean;
  person: PersonWithMembership | null;
  onClose: () => void;
  onSave: (personId: string, personData: PeopleUpdate, membershipId: string | null, membershipData: MembershipsUpdate) => Promise<void>;
};

/** Edit form for a person's core fields plus their linked membership, if any. */
export function EditPersonModal({ isOpen, person, onClose, onSave }: EditPersonModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [tier, setTier] = useState(MEMBERSHIP_TIERS[0]);
  const [status, setStatus] = useState(MEMBERSHIP_STATUSES[0]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !person) return;
    setName(person.full_name ?? "");
    setEmail(person.email ?? "");
    setPhone(person.phone ?? "");
    setAddress(person.address ?? "");
    setTier(person.membership?.tier ?? MEMBERSHIP_TIERS[0]);
    setStatus(person.membership?.status ?? MEMBERSHIP_STATUSES[0]);
    setEmailError(null);
    setPhoneError(null);
  }, [isOpen, person]);

  if (!person) return null;

  async function handleSubmit() {
    if (!person || !name.trim()) return;

    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    if (emailErr || phoneErr) return;

    setIsSaving(true);
    try {
      await onSave(
        person.id,
        {
          full_name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
        },
        person.membership?.id ?? null,
        { tier, status }
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit person"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label={isSaving ? "Saving…" : "Save"} variant="primary" onClick={handleSubmit} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Name" value={name} onChange={setName} />
        <div>
          <TextInput label="Email" value={email} onChange={setEmail} />
          {emailError ? (
            <Text size="sm" style={{ color: "#e5484d", marginTop: 4 }}>
              {emailError}
            </Text>
          ) : null}
        </div>
        <div>
          <TextInput label="Phone" value={phone} onChange={setPhone} />
          {phoneError ? (
            <Text size="sm" style={{ color: "#e5484d", marginTop: 4 }}>
              {phoneError}
            </Text>
          ) : null}
        </div>
        <TextInput label="Address" value={address} onChange={setAddress} />

        {person.membership ? (
          <>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Membership tier</span>
              <select value={tier} onChange={(event) => setTier(event.target.value)} style={selectStyle}>
                {MEMBERSHIP_TIERS.map((option) => (
                  <option key={option} value={option}>
                    {option[0].toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Membership status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)} style={selectStyle}>
                {MEMBERSHIP_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option[0].toUpperCase() + option.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
