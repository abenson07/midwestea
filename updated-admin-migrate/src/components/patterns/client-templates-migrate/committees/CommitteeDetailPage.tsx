"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus, Users2 } from "lucide-react";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { ContentListRow } from "@/components/patterns/client-templates-migrate/content/ContentListRow";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import {
  useAllActionItems,
  useCommitteeInterests,
  useCommitteeMeetingsList,
  useCommitteeVolunteerAsks,
  useDemoGuard,
  type VolunteerAskWithSignups,
} from "hooks";
import type { CommitteeInterests } from "@/types/database";
import {
  sampleCommitteeMembers,
  countChairs,
  displayMemberTitle,
  type CommitteeDetail,
  type CommitteeMemberRow,
} from "@/data/mocks/committees";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { CommitteeInfoBox } from "./CommitteeInfoBox";
import { CommitteeHubSection } from "./CommitteeHubSection";
import { InterestResponseModal } from "./InterestResponseModal";
import { CreateVolunteerAskModal } from "./CreateVolunteerAskModal";

export type CommitteeDetailPageProps = {
  committee: CommitteeDetail;
  committeeSlug: CommitteeSlug;
  members?: CommitteeMemberRow[];
  onSelectMember?: (row: CommitteeMemberRow) => void;
  onSelectMeeting?: (meetingId: string) => void;
};

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function cardStyle(): CSSProperties {
  return {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 20,
    background: "var(--linear-color-panel)",
    border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
    borderRadius: "var(--linear-radius-md)",
    boxShadow: "var(--linear-shadow-panel)",
    minHeight: 0,
  };
}

/**
 * Committee Overview — details + next meeting, members/pending, volunteer needs, action items.
 */
export function CommitteeDetailPage({
  committee,
  committeeSlug,
  members: membersProp,
  onSelectMember,
  onSelectMeeting,
}: CommitteeDetailPageProps) {
  const router = useRouter();
  const { enabled: demoMode } = useDemoModeOptional();
  const { enabled: demo, guard, sendDemoEmail } = useDemoGuard();
  const [selectedInterest, setSelectedInterest] = useState<CommitteeInterests | null>(null);
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [editingAsk, setEditingAsk] = useState<VolunteerAskWithSignups | null>(null);

  const {
    interests,
    loading: interestsLoading,
    respondWithEmail,
    markHandled,
  } = useCommitteeInterests({ committee: committeeSlug, status: "pending" });

  const {
    openAsks,
    filledAsks,
    loading: asksLoading,
    refetch: refetchAsks,
  } = useCommitteeVolunteerAsks(committeeSlug);

  const { meetings } = useCommitteeMeetingsList(committeeSlug);
  const { items: actionItems, loading: actionsLoading } = useAllActionItems();

  const members =
    membersProp ?? (demoMode ? sampleCommitteeMembers : []);

  const chairCount = countChairs(members);

  const nextMeeting = useMemo(() => {
    const upcoming = meetings
      .filter((m) => {
        const starts = m.events?.starts_at;
        if (!starts) return false;
        return new Date(starts).getTime() >= Date.now() && m.minutes_status !== "ready";
      })
      .sort((a, b) => {
        const aT = a.events?.starts_at ? new Date(a.events.starts_at).getTime() : 0;
        const bT = b.events?.starts_at ? new Date(b.events.starts_at).getTime() : 0;
        return aT - bT;
      });
    return upcoming[0] ?? null;
  }, [meetings]);

  const volunteerNeeds = useMemo(() => [...openAsks, ...filledAsks], [openAsks, filledAsks]);

  const committeeActionItems = useMemo(() => {
    return actionItems.filter(
      (item) =>
        item.status === "open" && item.committee_meetings?.committee === committeeSlug,
    );
  }, [actionItems, committeeSlug]);

  const nextMeetingDate = nextMeeting?.events?.starts_at
    ? new Date(nextMeeting.events.starts_at).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <ClassContentPage>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "4fr 1fr",
          gap: 16,
          alignItems: "stretch",
        }}
        className="committee-overview-top"
      >
        <style>{`
          @media (max-width: 900px) {
            .committee-overview-top {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }
        `}</style>
        <CommitteeInfoBox committee={committee} />
        <section style={cardStyle()}>
          <Text weight="semibold">Next meeting</Text>
          {nextMeeting ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              <Text size="sm" color="secondary">
                {nextMeetingDate}
              </Text>
              <Text weight="medium">{nextMeeting.events?.name ?? "Committee meeting"}</Text>
              <Button
                label="See details"
                variant="secondary"
                size="sm"
                onClick={() => onSelectMeeting?.(nextMeeting.id)}
              />
            </div>
          ) : (
            <Text size="sm" color="secondary" style={{ marginTop: 8 }}>
              No upcoming meeting scheduled.
            </Text>
          )}
        </section>
      </div>

      <CommitteeHubSection
        title="Action items"
        isEmpty={!actionsLoading && committeeActionItems.length === 0}
        emptyLabel="No open action items"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {committeeActionItems.map((item) => (
            <ContentListRow
              key={item.id}
              icon={<ClipboardList size={16} strokeWidth={1.75} />}
              title={item.title}
              subtitle={[
                item.assignee?.full_name ?? "Unassigned",
                formatWhen(item.due_at),
              ]
                .filter(Boolean)
                .join(" · ")}
              onClick={() => router.push("/admin-preview/action-items")}
            />
          ))}
        </div>
      </CommitteeHubSection>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
        className="committee-overview-mid"
      >
        <style>{`
          @media (max-width: 900px) {
            .committee-overview-mid {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }
        `}</style>

        <section style={cardStyle()}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text weight="semibold">Members</Text>
            <Text size="sm" color="secondary">
              {members.length + interests.length} total
            </Text>
          </div>
          {members.length === 0 && interests.length === 0 && !interestsLoading ? (
            <EmptyStateCard variant="plain" label="No members or pending interest" minHeight={72} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => onSelectMember?.(member)}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 4px",
                    borderRadius: "var(--linear-radius-sm)",
                    cursor: onSelectMember ? "pointer" : "default",
                  }}
                >
                  <Avatar name={member.name} size="sm" />
                  <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                    {member.name}
                  </Text>
                  <Text size="sm" color="secondary">
                    {displayMemberTitle(member.role, chairCount)}
                  </Text>
                </button>
              ))}
              {interests.map((interest) => (
                <div
                  key={interest.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 4px",
                  }}
                >
                  <Avatar name={interest.name} size="sm" />
                  <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                    {interest.name}
                  </Text>
                  <Button
                    label="Respond/Accept"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedInterest(interest)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={cardStyle()}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text weight="semibold">Volunteer Needs</Text>
            <IconButton
              label="Add ask"
              variant="ghost"
              size="sm"
              icon={<Plus size={14} strokeWidth={2} />}
              onClick={() => {
                setEditingAsk(null);
                setAskModalOpen(true);
              }}
            />
          </div>
          {!asksLoading && volunteerNeeds.length === 0 ? (
            <EmptyStateCard variant="plain" label="No volunteer needs yet" minHeight={72} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {volunteerNeeds.map((ask) => (
                <button
                  key={ask.id}
                  type="button"
                  onClick={() => {
                    setEditingAsk(ask);
                    setAskModalOpen(true);
                  }}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 4px",
                    borderRadius: "var(--linear-radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  <Users2 size={14} strokeWidth={1.75} style={{ color: "var(--linear-color-ink-subtle)" }} />
                  <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                    {ask.title}
                  </Text>
                  <Text size="sm" color="secondary">
                    {ask.signup_count}/{ask.quantity}
                  </Text>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

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

      <CreateVolunteerAskModal
        isOpen={askModalOpen}
        committee={committeeSlug}
        ask={editingAsk}
        onClose={() => {
          setAskModalOpen(false);
          setEditingAsk(null);
        }}
        onSaved={() => {
          void refetchAsks();
        }}
      />
    </ClassContentPage>
  );
}
