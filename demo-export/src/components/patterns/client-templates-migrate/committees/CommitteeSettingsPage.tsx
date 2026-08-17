"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { SettingsRow } from "@/components/patterns/client-templates-migrate/settings/SettingsRow";
import {
  useCommitteeInterests,
  useCommitteeVolunteerAsks,
  useDemoGuard,
  usePeople,
  type VolunteerAskWithSignups,
} from "hooks";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import type { CommitteeInterests } from "@/types/database";
import type {
  CommitteeDetail,
  CommitteeMemberRow,
  CommitteeMemberTitle,
  SampleVolunteerAsk,
} from "@/data/mocks/committees";
import { countChairs } from "@/data/mocks/committees";
import type { CommitteeSlug } from "schemas/committee_meetings";
import {
  listDemoVolunteerAsks,
  removeDemoVolunteerAsk,
  replaceDemoVolunteerAsks,
  upsertDemoVolunteerAsk,
} from "@/lib/demo/demoVolunteerAsks";
import { InterestResponseModal } from "./InterestResponseModal";
import { CreateVolunteerAskModal } from "./CreateVolunteerAskModal";

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

const selectStyle: CSSProperties = {
  ...rowInputStyle,
  width: 140,
  textAlign: "left",
};

const askFieldStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "6px 8px",
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

function Divider() {
  return (
    <div
      style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }}
    />
  );
}

export type CommitteeSettingsPageProps = {
  committeeSlug: CommitteeSlug;
  profile: CommitteeDetail;
  members: CommitteeMemberRow[];
  busy?: boolean;
  onProfileFieldChange: (patch: Partial<CommitteeDetail>) => void;
  onSaveProfile: () => Promise<void>;
  onTogglePublish: () => Promise<void>;
  onChangeMemberTitle: (memberId: string, title: CommitteeMemberTitle) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onAddMember: (person: { id: string; name: string; email: string }) => Promise<void>;
};

/**
 * Committee Settings — details, publish, members, volunteer asks.
 * Shared chrome for demo and live; profile/member mutations owned by parent.
 */
export function CommitteeSettingsPage({
  committeeSlug,
  profile,
  members,
  busy,
  onProfileFieldChange,
  onSaveProfile,
  onTogglePublish,
  onChangeMemberTitle,
  onRemoveMember,
  onAddMember,
}: CommitteeSettingsPageProps) {
  const { enabled: demoMode } = useDemoModeOptional();
  const { enabled: demo, guard, sendDemoEmail } = useDemoGuard();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [editingLiveAsk, setEditingLiveAsk] = useState<VolunteerAskWithSignups | null>(null);
  const [demoAsks, setDemoAsks] = useState<SampleVolunteerAsk[]>(() =>
    listDemoVolunteerAsks(committeeSlug),
  );
  const [editingDemoAskId, setEditingDemoAskId] = useState<string | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<CommitteeInterests | null>(null);

  useEffect(() => {
    setDemoAsks(listDemoVolunteerAsks(committeeSlug));
    setEditingDemoAskId(null);
  }, [committeeSlug]);

  const {
    interests,
    respondWithEmail,
    markHandled,
  } = useCommitteeInterests({ committee: committeeSlug, status: "pending" });

  const {
    openAsks,
    filledAsks,
    loading: asksLoading,
    refetch: refetchAsks,
  } = useCommitteeVolunteerAsks(committeeSlug);

  const liveAsks = useMemo(() => [...openAsks, ...filledAsks], [openAsks, filledAsks]);

  // Keep Settings card list in sync when Overview/modal mutates the demo store.
  useEffect(() => {
    if (!demoMode) return;
    setDemoAsks(listDemoVolunteerAsks(committeeSlug));
  }, [demoMode, committeeSlug, liveAsks]);

  const memberPersonIds = useMemo(
    () => new Set(members.map((m) => m.personId ?? m.id)),
    [members],
  );

  const { people: searchResults, loading: searchLoading } = usePeople({
    autoFetch: adding && search.trim().length > 0,
    filters: { search: search.trim() || undefined },
  });

  const candidates = useMemo(
    () => searchResults.filter((p) => !memberPersonIds.has(p.id)).slice(0, 12),
    [searchResults, memberPersonIds],
  );

  const isPublished = profile.publishStatus === "published";
  const chairCount = countChairs(members);

  async function runSave() {
    setSaving(true);
    try {
      await onSaveProfile();
    } finally {
      setSaving(false);
    }
  }

  function patchDemoAsk(id: string, patch: Partial<SampleVolunteerAsk>) {
    setDemoAsks((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a));
      replaceDemoVolunteerAsks(committeeSlug, next);
      return next;
    });
  }

  async function addDemoAsk() {
    const ask: SampleVolunteerAsk = {
      id: `demo-ask-${committeeSlug}-${Date.now()}`,
      committee: committeeSlug,
      title: "New volunteer ask",
      description: "",
      quantity: 1,
    };
    upsertDemoVolunteerAsk(ask);
    setDemoAsks(listDemoVolunteerAsks(committeeSlug));
    setEditingDemoAskId(ask.id);
    await guard(async () => undefined, { action: "Volunteer ask added" });
  }

  async function removeDemoAsk(id: string) {
    removeDemoVolunteerAsk(id, committeeSlug);
    setDemoAsks(listDemoVolunteerAsks(committeeSlug));
    if (editingDemoAskId === id) setEditingDemoAskId(null);
    await guard(async () => undefined, { action: "Volunteer ask removed" });
  }

  return (
    <div style={{ maxWidth: 760, marginInline: "auto", padding: "48px 24px 64px" }}>
      <VStack gap={8}>
        <Heading level={1}>Committee settings</Heading>

        <VStack gap={3}>
          <Text type="label" color="secondary">
            Committee details
          </Text>
          <Card padding={4}>
            <VStack gap={4}>
              <SettingsRow
                label="Committee name"
                description="Shown in the admin and on the website"
                control={
                  <input
                    style={rowInputStyle}
                    value={profile.name}
                    disabled={busy}
                    onChange={(e) => onProfileFieldChange({ name: e.target.value })}
                  />
                }
              />
              <Divider />
              <VStack gap={1.5}>
                <VStack gap={0.5}>
                  <Text weight="medium" display="block">
                    Description
                  </Text>
                  <Text size="sm" color="secondary" display="block">
                    Public summary of the committee
                  </Text>
                </VStack>
                <textarea
                  value={profile.description}
                  disabled={busy}
                  onChange={(e) => onProfileFieldChange({ description: e.target.value })}
                  style={{
                    boxSizing: "border-box",
                    width: "100%",
                    aspectRatio: "16 / 3",
                    resize: "none",
                    padding: 12,
                    borderRadius: "var(--linear-radius-md)",
                    border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                    background: "var(--linear-color-canvas)",
                    color: "var(--linear-color-ink)",
                    fontSize: 13,
                    fontFamily: "inherit",
                    lineHeight: 1.45,
                  }}
                />
              </VStack>
            </VStack>
          </Card>
        </VStack>

        <VStack gap={3}>
          <Text type="label" color="secondary">
            Published status
          </Text>
          <Card padding={4}>
            <SettingsRow
              label={isPublished ? "Published" : "Draft"}
              description={
                isPublished
                  ? "This committee page is visible on the website"
                  : "This committee page is not published yet"
              }
              control={
                <Button
                  label={isPublished ? "Unpublish" : "Publish"}
                  variant={isPublished ? "secondary" : "primary"}
                  size="sm"
                  disabled={busy}
                  onClick={() => void onTogglePublish()}
                />
              }
            />
          </Card>
        </VStack>

        <VStack gap={3}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Text type="label" color="secondary">
              Members
            </Text>
            <Text size="sm" color="secondary">
              {members.length + interests.length} total
            </Text>
          </div>
          <Card padding={4}>
            <VStack gap={3}>
              {members.length === 0 && interests.length === 0 ? (
                <Text size="sm" color="secondary">
                  No members or pending interest yet.
                </Text>
              ) : (
                <>
                  {members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        paddingBlock: 4,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text weight="medium" display="block">
                          {member.name}
                        </Text>
                        {member.email ? (
                          <Text size="sm" color="secondary" display="block">
                            {member.email}
                          </Text>
                        ) : null}
                      </div>
                      <select
                        value={member.role}
                        disabled={busy}
                        onChange={(e) => {
                          void onChangeMemberTitle(
                            member.id,
                            e.target.value as CommitteeMemberTitle,
                          );
                        }}
                        style={selectStyle}
                        aria-label={`Title for ${member.name}`}
                      >
                        <option value="Member">Member</option>
                        <option value="Chair">{chairCount > 1 ? "Co-Chair" : "Chair"}</option>
                      </select>
                      <IconButton
                        label={`Remove ${member.name}`}
                        variant="ghost"
                        size="sm"
                        icon={<X size={14} strokeWidth={1.75} />}
                        isDisabled={busy}
                        onClick={() => void onRemoveMember(member.id)}
                      />
                    </div>
                  ))}
                  {interests.map((interest) => (
                    <div
                      key={interest.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        paddingBlock: 4,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text weight="medium" display="block">
                          {interest.name}
                        </Text>
                        {interest.contact ? (
                          <Text size="sm" color="secondary" display="block">
                            {interest.contact}
                          </Text>
                        ) : null}
                      </div>
                      <Text size="sm" color="secondary" style={{ flexShrink: 0 }}>
                        Prospective
                      </Text>
                      <Button
                        label="Respond/Accept"
                        variant="secondary"
                        size="sm"
                        disabled={busy}
                        onClick={() => setSelectedInterest(interest)}
                      />
                    </div>
                  ))}
                </>
              )}

              <Divider />

              {!adding ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setAdding(true)}
                  style={{
                    all: "unset",
                    cursor: busy ? "default" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--linear-color-ink-subtle)",
                  }}
                >
                  <Plus size={14} strokeWidth={1.75} />
                  Add member
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    type="search"
                    placeholder="Search people…"
                    value={search}
                    autoFocus
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ ...rowInputStyle, width: "100%", textAlign: "left" }}
                  />
                  {search.trim().length === 0 ? (
                    <Text size="sm" color="secondary">
                      Type a name or email to search
                    </Text>
                  ) : null}
                  {searchLoading && search.trim() ? (
                    <Text size="sm" color="secondary">
                      Searching…
                    </Text>
                  ) : null}
                  {candidates.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        void onAddMember({
                          id: p.id,
                          name: p.full_name,
                          email: p.email ?? "",
                        }).then(() => {
                          setSearch("");
                          setAdding(false);
                        });
                      }}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        padding: "6px 4px",
                        borderRadius: "var(--linear-radius-sm)",
                      }}
                    >
                      <Text weight="medium">{p.full_name}</Text>
                      {p.email ? (
                        <Text size="sm" color="secondary">
                          {" "}
                          · {p.email}
                        </Text>
                      ) : null}
                    </button>
                  ))}
                  {search.trim() && !searchLoading && candidates.length === 0 ? (
                    <Text size="sm" color="secondary">
                      No matching people
                    </Text>
                  ) : null}
                  <Button
                    label="Cancel"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAdding(false);
                      setSearch("");
                    }}
                  />
                </div>
              )}
            </VStack>
          </Card>
        </VStack>

        <VStack gap={3}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Text type="label" color="secondary">
              Volunteer asks
            </Text>
            <IconButton
              label="Add ask"
              variant="ghost"
              size="sm"
              icon={<Plus size={14} strokeWidth={2} />}
              onClick={() => {
                if (demoMode) {
                  void addDemoAsk();
                  return;
                }
                setEditingLiveAsk(null);
                setAskModalOpen(true);
              }}
            />
          </div>

          {demoMode ? (
            demoAsks.length === 0 ? (
              <Text size="sm" color="secondary">
                No volunteer asks yet.
              </Text>
            ) : (
              demoAsks.map((ask) => {
                const editing = editingDemoAskId === ask.id;
                return (
                  <Card key={ask.id} padding={4}>
                    {editing ? (
                      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                          <input
                            style={{ ...askFieldStyle, fontWeight: 510 }}
                            value={ask.title}
                            onChange={(e) => patchDemoAsk(ask.id, { title: e.target.value })}
                            placeholder="Title"
                          />
                          <textarea
                            style={{ ...askFieldStyle, resize: "vertical", minHeight: 56 }}
                            value={ask.description}
                            onChange={(e) =>
                              patchDemoAsk(ask.id, { description: e.target.value })
                            }
                            placeholder="Description"
                            rows={2}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                            <Text size="sm" color="secondary">
                              Quantity
                            </Text>
                            <input
                              type="number"
                              min={1}
                              style={{ ...askFieldStyle, width: 72, textAlign: "right" }}
                              value={ask.quantity}
                              onChange={(e) =>
                                patchDemoAsk(ask.id, {
                                  quantity: Math.max(1, Number(e.target.value) || 1),
                                })
                              }
                            />
                          </label>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Button
                              label="Done"
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setEditingDemoAskId(null);
                                toast.success("Volunteer ask updated — demo mode, saved locally only");
                              }}
                            />
                            <IconButton
                              label="Remove ask"
                              variant="ghost"
                              size="sm"
                              icon={<X size={14} strokeWidth={1.75} />}
                              onClick={() => void removeDemoAsk(ask.id)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingDemoAskId(ask.id)}
                        style={{
                          all: "unset",
                          boxSizing: "border-box",
                          display: "flex",
                          gap: 16,
                          width: "100%",
                          cursor: "pointer",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text weight="semibold" display="block">
                            {ask.title || "Untitled ask"}
                          </Text>
                          <Text size="sm" color="secondary" display="block" style={{ marginTop: 4 }}>
                            {ask.description || "No description"}
                          </Text>
                        </div>
                        <Text weight="medium" style={{ flexShrink: 0 }}>
                          {ask.quantity}
                        </Text>
                      </button>
                    )}
                  </Card>
                );
              })
            )
          ) : asksLoading ? (
            <Text size="sm" color="secondary">
              Loading…
            </Text>
          ) : liveAsks.length === 0 ? (
            <Text size="sm" color="secondary">
              No volunteer asks yet.
            </Text>
          ) : (
            liveAsks.map((ask) => (
              <Card key={ask.id} padding={4}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLiveAsk(ask);
                    setAskModalOpen(true);
                  }}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "flex",
                    gap: 16,
                    width: "100%",
                    cursor: "pointer",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text weight="semibold" display="block">
                      {ask.title}
                    </Text>
                    <Text size="sm" color="secondary" display="block" style={{ marginTop: 4 }}>
                      {ask.description || "No description"}
                    </Text>
                  </div>
                  <Text weight="medium" style={{ flexShrink: 0 }}>
                    {ask.quantity}
                  </Text>
                </button>
              </Card>
            ))
          )}
        </VStack>

        <div>
          <Button
            label={saving || busy ? "Saving…" : "Save changes"}
            variant="primary"
            disabled={saving || busy}
            onClick={() => void runSave()}
          />
        </div>
      </VStack>

      <InterestResponseModal
        interest={selectedInterest}
        onClose={() => setSelectedInterest(null)}
        onSend={async (payload) => {
          if (!selectedInterest) return;
          if (demo) {
            await sendDemoEmail({
              subject: payload.subject,
              text: payload.text,
              context: `Committee interest reply, originally to ${selectedInterest.contact}`,
            });
            setSelectedInterest(null);
            return;
          }
          await respondWithEmail(selectedInterest.id, payload);
          setSelectedInterest(null);
        }}
        onMarkHandled={async () => {
          if (!selectedInterest) return;
          await guard(() => markHandled(selectedInterest.id), { action: "Interest marked handled" });
          setSelectedInterest(null);
        }}
      />

      {!demoMode ? (
        <CreateVolunteerAskModal
          isOpen={askModalOpen}
          committee={committeeSlug}
          ask={editingLiveAsk}
          onClose={() => {
            setAskModalOpen(false);
            setEditingLiveAsk(null);
          }}
          onSaved={() => {
            void refetchAsks();
            setAskModalOpen(false);
            setEditingLiveAsk(null);
          }}
        />
      ) : null}
    </div>
  );
}
