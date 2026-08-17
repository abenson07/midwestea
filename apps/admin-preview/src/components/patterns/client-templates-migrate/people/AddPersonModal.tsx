"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import type { MemberRow, MembershipType, NeighborRow, VolunteerRow } from "./types";

export type PeopleView = "members" | "neighbors" | "volunteers";

export type AddPersonModalProps = {
  isOpen: boolean;
  view: PeopleView;
  onClose: () => void;
  onAddMember: (row: Omit<MemberRow, "id">) => void;
  onAddNeighbor: (row: Omit<NeighborRow, "id">) => void;
  onAddVolunteer: (row: Omit<VolunteerRow, "id">) => void;
};

const MEMBERSHIP_TYPES: Exclude<MembershipType, "no-tier">[] = ["household", "individual", "senior", "student"];
const MEMBERSHIP_TYPE_LABEL: Record<MembershipType, string> = {
  household: "Household",
  individual: "Individual",
  senior: "Senior",
  student: "Student",
  "no-tier": "No tier",
};

const TITLE: Record<PeopleView, string> = {
  members: "Add member",
  neighbors: "Add neighbor",
  volunteers: "Add volunteer",
};

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

/** Add-person form, split by the active People view since each roster tracks different fields. */
export function AddPersonModal({
  isOpen,
  view,
  onClose,
  onAddMember,
  onAddNeighbor,
  onAddVolunteer,
}: AddPersonModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [membershipType, setMembershipType] = useState<MembershipType>(MEMBERSHIP_TYPES[0]);
  const [address, setAddress] = useState("");
  const [interestArea, setInterestArea] = useState("");
  const [hasVolunteeredBefore, setHasVolunteeredBefore] = useState(false);
  const [date, setDate] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setEmail("");
    setMembershipType(MEMBERSHIP_TYPES[0]);
    setAddress("");
    setInterestArea("");
    setHasVolunteeredBefore(false);
    setDate("");
  }, [isOpen, view]);

  function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (view === "members") {
      onAddMember({
        name: name.trim(),
        email: email.trim(),
        membershipType,
        memberSince: date ? formatDate(date) : today,
      });
    } else if (view === "neighbors") {
      onAddNeighbor({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        joinedDate: date ? formatDate(date) : today,
      });
    } else {
      onAddVolunteer({
        name: name.trim(),
        email: email.trim(),
        interestArea: interestArea.trim(),
        hasVolunteeredBefore,
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
        <TextInput label="Name" value={name} onChange={setName} />
        <TextInput label="Email" value={email} onChange={setEmail} />

        {view === "members" ? (
          <>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Membership type</span>
              <select
                value={membershipType}
                onChange={(event) => setMembershipType(event.target.value as MembershipType)}
                style={selectStyle}
              >
                {MEMBERSHIP_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {MEMBERSHIP_TYPE_LABEL[option]}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Member since</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                style={selectStyle}
              />
            </label>
          </>
        ) : null}

        {view === "neighbors" ? (
          <>
            <TextInput label="Address" value={address} onChange={setAddress} />
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Joined date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                style={selectStyle}
              />
            </label>
          </>
        ) : null}

        {view === "volunteers" ? (
          <>
            <TextInput label="Interest area" value={interestArea} onChange={setInterestArea} />
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Has volunteered before?</span>
              <select
                value={hasVolunteeredBefore ? "yes" : "no"}
                onChange={(event) => setHasVolunteeredBefore(event.target.value === "yes")}
                style={selectStyle}
              >
                <option value="no">Not yet</option>
                <option value="yes">Yes</option>
              </select>
            </label>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
