"use client";

import { useState } from "react";
import type { PersonWithMembership, BusinessWithDetails } from "hooks";
import { MobileBottomSheet } from "./MobileBottomSheet";
import {
  MobileLogCashMembership,
  MobileLogDonation,
} from "./MobileQuickActions";
import { mobilePrimaryBtnStyle, mobileSecondaryBtnStyle } from "./mobileStyles";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

export type MobilePersonSheetProps = {
  person: PersonWithMembership | null;
  onClose: () => void;
  onRefetch?: () => void;
};

export function MobilePersonSheet({ person, onClose, onRefetch }: MobilePersonSheetProps) {
  const [cashOpen, setCashOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const isMember = Boolean(person?.membership_id);

  return (
    <>
      <MobileBottomSheet
        open={person != null}
        onClose={onClose}
        title={person?.full_name ?? "Person"}
      >
        {person ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Email" value={person.email ?? "—"} />
            <Field label="Phone" value={person.phone ?? "—"} />
            <Field label="Address" value={person.address ?? "—"} />
            <Field
              label="Membership"
              value={
                isMember
                  ? `${person.membership?.tier ?? "Member"} · ${person.membership?.status ?? "active"}`
                  : "Not a member"
              }
            />
            {person.roles?.length ? (
              <Field label="Roles" value={person.roles.join(", ")} />
            ) : null}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {!isMember ? (
                <button type="button" style={mobilePrimaryBtnStyle} onClick={() => setCashOpen(true)}>
                  Make member (cash)
                </button>
              ) : null}
              <button
                type="button"
                style={isMember ? mobilePrimaryBtnStyle : mobileSecondaryBtnStyle}
                onClick={() => setDonationOpen(true)}
              >
                Log donation
              </button>
            </div>
          </div>
        ) : null}
      </MobileBottomSheet>

      <MobileLogCashMembership
        open={cashOpen}
        person={person}
        onClose={() => setCashOpen(false)}
        onDone={() => {
          setCashOpen(false);
          onRefetch?.();
        }}
      />
      <MobileLogDonation
        open={donationOpen}
        personName={person?.full_name}
        onClose={() => setDonationOpen(false)}
      />
    </>
  );
}

export type MobileBusinessSheetProps = {
  business: BusinessWithDetails | null;
  onClose: () => void;
};

export function MobileBusinessSheet({ business, onClose }: MobileBusinessSheetProps) {
  return (
    <MobileBottomSheet
      open={business != null}
      onClose={onClose}
      title={business?.business_name ?? "Business"}
    >
      {business ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Contact" value={business.contact_name ?? "—"} />
          <Field label="Email" value={business.email ?? "—"} />
          <Field label="Phone" value={business.phone ?? "—"} />
          <Field label="Website" value={business.website ?? "—"} />
          <Field label="Member" value={business.is_member ? "Yes" : "No"} />
          <Field label="Past sponsor" value={business.is_past_sponsor ? "Yes" : "No"} />
        </div>
      ) : null}
    </MobileBottomSheet>
  );
}
