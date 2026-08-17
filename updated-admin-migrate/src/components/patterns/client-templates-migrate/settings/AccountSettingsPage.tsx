"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { useWipFeaturesOptional } from "@/components/patterns/foundation/WipFeaturesContext";
import { Card } from "@/components/patterns/primitives/Card";
import { Switch } from "@/components/patterns/primitives/Switch";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { IconButton } from "@/components/patterns/primitives/IconButton";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { validateEmail, validatePhone } from "@/lib/validation";
import { useCurrentPerson, useMyCommitteeMemberships, usePeople } from "hooks";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import { getDemoEntity, upsertDemoEntity, writeDemoScoped, listDemoScoped } from "@/lib/demo/demoStore";
import { SettingsRow } from "./SettingsRow";

function Divider() {
  return (
    <div style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }} />
  );
}

const rowInputStyle = {
  boxSizing: "border-box" as const,
  width: 260,
  height: 30,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
  textAlign: "right" as const,
};

const roleSelectStyle = {
  ...rowInputStyle,
  width: 110,
  textAlign: "left" as const,
};

type Membership = {
  id: string;
  committee: CommitteeSlug;
  title: "chair" | "co_chair" | "member";
};

const DEMO_NAME = "Kyle Brower";
const DEMO_EMAIL = "kyle.brower@example.com";
const DEMO_PHONE = "(555) 123-4567";
const DEMO_MEMBERSHIPS: Membership[] = [
  { id: "demo-events", committee: "events", title: "chair" },
  { id: "demo-outreach", committee: "outreach", title: "member" },
];

const ALL_COMMITTEE_SLUGS = Object.keys(COMMITTEE_LABELS) as CommitteeSlug[];

/** Select value: co_chair (legacy rows) collapses to chair — matches CommitteeSettingsPage. */
function membershipTitleToSelectValue(title: Membership["title"]): "chair" | "member" {
  return title === "chair" || title === "co_chair" ? "chair" : "member";
}

function AddCommitteeMenu({
  availableCommittees,
  onAdd,
}: {
  availableCommittees: CommitteeSlug[];
  onAdd: (committee: CommitteeSlug) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (availableCommittees.length === 0) return null;

  return (
    <Dropdown
      label="Join a committee"
      open={menuOpen}
      onOpenChange={setMenuOpen}
      placement="below"
      alignment="end"
      trigger={
        <IconButton
          label="Join a committee"
          variant="ghost"
          size="sm"
          icon={<Plus size={16} strokeWidth={1.75} />}
        />
      }
    >
      {availableCommittees.map((committee) => (
        <DropdownItem
          key={committee}
          label={COMMITTEE_LABELS[committee]}
          onSelect={() => {
            setMenuOpen(false);
            onAdd(committee);
          }}
        />
      ))}
    </Dropdown>
  );
}

function MembershipRow({
  membership,
  onChangeTitle,
  onRemove,
}: {
  membership: Membership;
  onChangeTitle: (title: "chair" | "member") => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text weight="medium" display="block">
          {COMMITTEE_LABELS[membership.committee]}
        </Text>
      </div>
      <select
        value={membershipTitleToSelectValue(membership.title)}
        onChange={(event) => onChangeTitle(event.target.value as "chair" | "member")}
        style={roleSelectStyle}
        aria-label={`Role in ${COMMITTEE_LABELS[membership.committee]}`}
      >
        <option value="member">Member</option>
        <option value="chair">Chair</option>
      </select>
      <Dropdown
        label={`${COMMITTEE_LABELS[membership.committee]} actions`}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        placement="below"
        alignment="end"
        trigger={
          <IconButton
            label={`${COMMITTEE_LABELS[membership.committee]} actions`}
            variant="ghost"
            size="sm"
            icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
          />
        }
      >
        <DropdownItem
          label="Remove"
          onSelect={() => {
            setMenuOpen(false);
            onRemove();
          }}
        />
      </Dropdown>
    </div>
  );
}

/**
 * Account settings — reached by clicking the workspace name in the top-left
 * of the sidebar. Details (name/email) + Committees the current person belongs
 * to, with a per-row "…" menu to leave a committee.
 */
export function AccountSettingsPage() {
  const { enabled: demo } = useDemoModeOptional();
  const { enabled: wipFeaturesEnabled, setEnabled: setWipFeaturesEnabled } = useWipFeaturesOptional();
  const { person: currentPerson, loading: personLoading, refetch: refetchPerson } = useCurrentPerson();
  const { update: updatePerson } = usePeople({ autoFetch: false });
  const {
    memberships: liveMemberships,
    loading: membershipsLoading,
    removeMembership,
    addMembership,
    updateMembershipTitle,
  } = useMyCommitteeMemberships(demo ? null : currentPerson?.id ?? null);

  const [demoMemberships, setDemoMemberships] = useState<Membership[]>(DEMO_MEMBERSHIPS);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (demo) {
      const profile = getDemoEntity<{ id: string; name?: string; email?: string; phone?: string }>(
        "accountSettings",
        "profile",
      );
      setName(profile?.name ?? DEMO_NAME);
      setEmail(profile?.email ?? DEMO_EMAIL);
      setPhone(profile?.phone ?? DEMO_PHONE);
      const memberships = listDemoScoped<Membership>("accountSettings", "memberships");
      setDemoMemberships(memberships ?? DEMO_MEMBERSHIPS);
      return;
    }
    if (currentPerson) {
      setName(currentPerson.full_name ?? "");
      setEmail(currentPerson.email ?? "");
      setPhone(currentPerson.phone ?? "");
    }
  }, [demo, currentPerson]);

  function persistDemoMemberships(next: Membership[]) {
    setDemoMemberships(next);
    writeDemoScoped("accountSettings", "memberships", next);
  }

  const dirty =
    !demo &&
    currentPerson != null &&
    (name.trim() !== (currentPerson.full_name ?? "") ||
      email.trim() !== (currentPerson.email ?? "") ||
      phone.trim() !== (currentPerson.phone ?? ""));

  async function handleSave() {
    if (demo) {
      upsertDemoEntity("accountSettings", {
        id: "profile",
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      toast.success("Saved — demo mode, saved locally only");
      return;
    }
    if (!currentPerson) return;

    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    if (emailErr || phoneErr || !name.trim()) return;

    setSaving(true);
    try {
      const result = await updatePerson(currentPerson.id, {
        full_name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      });
      if (result) {
        await refetchPerson();
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(membership: Membership) {
    if (demo) {
      persistDemoMemberships(demoMemberships.filter((m) => m.id !== membership.id));
      toast.success(
        `Removed from ${COMMITTEE_LABELS[membership.committee]} — demo mode, saved locally only`,
      );
      return;
    }
    try {
      await removeMembership(membership.id);
      toast.success(`Removed from ${COMMITTEE_LABELS[membership.committee]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove membership");
    }
  }

  async function handleChangeTitle(membership: Membership, title: "chair" | "member") {
    if (demo) {
      persistDemoMemberships(
        demoMemberships.map((m) => (m.id === membership.id ? { ...m, title } : m)),
      );
      return;
    }
    try {
      await updateMembershipTitle(membership.id, title);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function handleAdd(committee: CommitteeSlug) {
    if (demo) {
      persistDemoMemberships([
        ...demoMemberships,
        { id: `demo-${committee}`, committee, title: "member" },
      ]);
      toast.success(`Joined ${COMMITTEE_LABELS[committee]} — demo mode, saved locally only`);
      return;
    }
    try {
      await addMembership(committee);
      toast.success(`Joined ${COMMITTEE_LABELS[committee]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join committee");
    }
  }

  const memberships = demo ? demoMemberships : liveMemberships;
  const loadingMemberships = !demo && (personLoading || membershipsLoading);
  const availableCommittees = ALL_COMMITTEE_SLUGS.filter(
    (slug) => !memberships.some((m) => m.committee === slug),
  );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={<CanvasHeader topbar={{ title: "Settings" }} />}
      >
        <div
          style={{
            height: "100%",
            minHeight: 0,
            overflow: "auto",
            boxSizing: "border-box",
            padding: "48px 24px 64px",
          }}
        >
          <div style={{ maxWidth: 640, marginInline: "auto" }}>
            <VStack gap={8}>
              <Heading level={1}>Settings</Heading>

              <VStack gap={3}>
                <Text type="label" color="secondary">
                  Details
                </Text>
                <Card padding={4}>
                  <VStack gap={4}>
                    <SettingsRow
                      label="Name"
                      description="Your first and last name"
                      control={
                        <input
                          style={rowInputStyle}
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                        />
                      }
                    />
                    <Divider />
                    <SettingsRow
                      label="Email address"
                      control={
                        <input
                          type="email"
                          style={rowInputStyle}
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                      }
                    />
                    <Divider />
                    <SettingsRow
                      label="Phone number"
                      control={
                        <input
                          type="tel"
                          style={rowInputStyle}
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                        />
                      }
                    />
                    <Divider />
                    <SettingsRow
                      label="Preview features in development"
                      description="Show committees, inbox, and action items in your view. These aren't finished — only your browser is affected."
                      control={
                        <Switch
                          label="Preview features in development"
                          isLabelHidden
                          value={wipFeaturesEnabled}
                          onChange={setWipFeaturesEnabled}
                        />
                      }
                    />
                  </VStack>
                  {emailError ? (
                    <Text size="sm" style={{ color: "#e5484d", display: "block", marginTop: 8 }}>
                      {emailError}
                    </Text>
                  ) : null}
                  {phoneError ? (
                    <Text size="sm" style={{ color: "#e5484d", display: "block", marginTop: 8 }}>
                      {phoneError}
                    </Text>
                  ) : null}
                  {demo || dirty ? (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                      <Button
                        label={saving ? "Saving…" : "Save"}
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                      />
                    </div>
                  ) : null}
                </Card>
              </VStack>

              <VStack gap={3}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Text type="label" color="secondary">
                    Committees
                  </Text>
                  <AddCommitteeMenu availableCommittees={availableCommittees} onAdd={handleAdd} />
                </div>
                <Card padding={4}>
                  {loadingMemberships ? (
                    <Text color="secondary">Loading…</Text>
                  ) : memberships.length === 0 ? (
                    <Text color="secondary">You&apos;re not on any committees yet.</Text>
                  ) : (
                    <VStack gap={4}>
                      {memberships.flatMap((membership, index) => [
                        index > 0 ? <Divider key={`divider-${membership.id}`} /> : null,
                        <MembershipRow
                          key={membership.id}
                          membership={membership}
                          onChangeTitle={(title) => handleChangeTitle(membership, title)}
                          onRemove={() => handleRemove(membership)}
                        />,
                      ])}
                    </VStack>
                  )}
                </Card>
              </VStack>
            </VStack>
          </div>
        </div>
      </FoundationLayout>
    </div>
  );
}
