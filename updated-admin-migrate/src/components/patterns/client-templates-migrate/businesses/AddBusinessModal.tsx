"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import type {
  BusinessMemberRow,
  BusinessMembershipStatus,
  BusinessRow,
  SponsorRow,
  SponsorshipLevel,
} from "./types";

export type BusinessesView = "members" | "sponsors" | "all";

export type AddBusinessModalProps = {
  isOpen: boolean;
  view: BusinessesView;
  onClose: () => void;
  onAddMember: (row: Omit<BusinessMemberRow, "id">) => void;
  onAddSponsor: (row: Omit<SponsorRow, "id">) => void;
  onAddBusiness: (row: Omit<BusinessRow, "id">) => void;
};

const STATUSES: BusinessMembershipStatus[] = ["active", "past_due", "pending", "lapsed"];
const STATUS_LABEL: Record<BusinessMembershipStatus, string> = {
  active: "Active",
  past_due: "Past Due",
  pending: "Pending",
  lapsed: "Lapsed",
};

const LEVELS: SponsorshipLevel[] = ["platinum", "gold", "silver", "bronze"];
const LEVEL_LABEL: Record<SponsorshipLevel, string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

const TITLE: Record<BusinessesView, string> = {
  members: "Add business member",
  sponsors: "Add sponsor",
  all: "Add business",
};

const CURRENT_YEAR = new Date().getFullYear();

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

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Add-business form, split by the active Businesses view since each roster tracks different fields. */
export function AddBusinessModal({
  isOpen,
  view,
  onClose,
  onAddMember,
  onAddSponsor,
  onAddBusiness,
}: AddBusinessModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [tier, setTier] = useState("Gold");
  const [renewalDate, setRenewalDate] = useState("");
  const [status, setStatus] = useState<BusinessMembershipStatus>(STATUSES[0]);
  const [memberSince, setMemberSince] = useState("");
  const [annualDues, setAnnualDues] = useState("");
  const [sponsorshipLevel, setSponsorshipLevel] = useState<SponsorshipLevel>(LEVELS[0]);
  const [amount, setAmount] = useState("");
  const [lastSponsoredYear, setLastSponsoredYear] = useState(String(CURRENT_YEAR));
  const [sponsorSince, setSponsorSince] = useState("");
  const [category, setCategory] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setBusinessName("");
    setTier("Gold");
    setRenewalDate("");
    setStatus(STATUSES[0]);
    setMemberSince("");
    setAnnualDues("");
    setSponsorshipLevel(LEVELS[0]);
    setAmount("");
    setLastSponsoredYear(String(CURRENT_YEAR));
    setSponsorSince("");
    setCategory("");
    setContactName("");
    setPhone("");
  }, [isOpen, view]);

  function handleSubmit() {
    if (!businessName.trim()) return;
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (view === "members") {
      onAddMember({
        businessName: businessName.trim(),
        tier: tier.trim(),
        renewalDate: renewalDate ? formatDate(renewalDate) : today,
        status,
        memberSince: memberSince ? formatDate(memberSince) : today,
        annualDues: Number(annualDues) || 0,
      });
    } else if (view === "sponsors") {
      onAddSponsor({
        businessName: businessName.trim(),
        sponsorshipLevel,
        amount: Number(amount) || 0,
        lastSponsoredYear: Number(lastSponsoredYear) || CURRENT_YEAR,
        sponsorSince: sponsorSince ? formatDate(sponsorSince) : today,
      });
    } else {
      onAddBusiness({
        businessName: businessName.trim(),
        category: category.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
      });
    }
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={TITLE[view]}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label={TITLE[view]} variant="primary" onClick={handleSubmit} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Business name" value={businessName} onChange={setBusinessName} />

        {view === "members" ? (
          <>
            <TextInput label="Tier" value={tier} onChange={setTier} />
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as BusinessMembershipStatus)}
                style={selectStyle}
              >
                {STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {STATUS_LABEL[option]}
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
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Member since</span>
              <input
                type="date"
                value={memberSince}
                onChange={(event) => setMemberSince(event.target.value)}
                style={selectStyle}
              />
            </label>
            <TextInput label="Annual dues" value={annualDues} onChange={setAnnualDues} />
          </>
        ) : null}

        {view === "sponsors" ? (
          <>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Sponsorship level</span>
              <select
                value={sponsorshipLevel}
                onChange={(event) => setSponsorshipLevel(event.target.value as SponsorshipLevel)}
                style={selectStyle}
              >
                {LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {LEVEL_LABEL[option]}
                  </option>
                ))}
              </select>
            </label>
            <TextInput label="Amount" value={amount} onChange={setAmount} />
            <TextInput label="Last sponsored year" value={lastSponsoredYear} onChange={setLastSponsoredYear} />
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Sponsor since</span>
              <input
                type="date"
                value={sponsorSince}
                onChange={(event) => setSponsorSince(event.target.value)}
                style={selectStyle}
              />
            </label>
          </>
        ) : null}

        {view === "all" ? (
          <>
            <TextInput label="Category" value={category} onChange={setCategory} />
            <TextInput label="Contact name" value={contactName} onChange={setContactName} />
            <TextInput label="Phone" value={phone} onChange={setPhone} />
          </>
        ) : null}
      </div>
    </Modal>
  );
}
