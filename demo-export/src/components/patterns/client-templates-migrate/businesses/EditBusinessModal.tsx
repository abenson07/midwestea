"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";
import { validateEmail, validatePhone } from "@/lib/validation";
import type { BusinessWithDetails } from "hooks";
import type { BusinessesUpdate, BusinessMembershipsUpdate } from "@/types/database";

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

const MEMBERSHIP_STATUSES = ["active", "pending", "past_due", "lapsed"];

export type EditBusinessModalProps = {
  isOpen: boolean;
  business: BusinessWithDetails | null;
  onClose: () => void;
  onSave: (
    businessId: string,
    businessData: BusinessesUpdate,
    membershipId: string | null,
    membershipData: BusinessMembershipsUpdate
  ) => Promise<void>;
};

/** Edit form for a business's core fields plus its linked business_memberships record, if any. */
export function EditBusinessModal({ isOpen, business, onClose, onSave }: EditBusinessModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState(MEMBERSHIP_STATUSES[0]);
  const [renewalDate, setRenewalDate] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !business) return;
    setBusinessName(business.business_name ?? "");
    setContactName(business.contact_name ?? "");
    setEmail(business.email ?? "");
    setPhone(business.phone ?? "");
    setAddress(business.address ?? "");
    setWebsite(business.website ?? "");
    setStatus(business.membership?.status ?? MEMBERSHIP_STATUSES[0]);
    setRenewalDate(business.membership?.last_renewal ?? "");
    setEmailError(null);
    setPhoneError(null);
  }, [isOpen, business]);

  if (!business) return null;

  async function handleSubmit() {
    if (!business || !businessName.trim()) return;

    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    if (emailErr || phoneErr) return;

    setIsSaving(true);
    try {
      await onSave(
        business.id,
        {
          business_name: businessName.trim(),
          contact_name: contactName.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          website: website.trim() || null,
        },
        business.membership?.id ?? null,
        { status, last_renewal: renewalDate }
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
      title="Edit business"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label={isSaving ? "Saving…" : "Save"} variant="primary" onClick={handleSubmit} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Business name" value={businessName} onChange={setBusinessName} />
        <TextInput label="Contact name" value={contactName} onChange={setContactName} />
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
        <TextInput label="Website" value={website} onChange={setWebsite} />

        {business.membership ? (
          <>
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
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Renewal date</span>
              <input
                type="date"
                value={renewalDate}
                onChange={(event) => setRenewalDate(event.target.value)}
                style={selectStyle}
              />
            </label>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
