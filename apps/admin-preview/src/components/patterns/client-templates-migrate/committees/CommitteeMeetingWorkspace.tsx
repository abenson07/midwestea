"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Badge } from "@/components/patterns/primitives/Badge";
import { agendaPlainText } from "@/lib/committee-meetings/committeeMeetingUtils";
import {
  useCommitteeMeetingById,
  useOutstandingActionItems,
  usePeople,
  useDemoGuard,
  textToAgendaJson,
  textToStructuredMinutes,
  structuredMinutesToText,
  type MeetingActionItem,
} from "hooks";
import type { ActionItemStatus } from "schemas/action_items";

const sectionStyle = {
  boxSizing: "border-box" as const,
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: 12,
  padding: 20,
  background: "var(--linear-color-panel)",
  border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
  borderRadius: "var(--linear-radius-md)",
  boxShadow: "var(--linear-shadow-panel)",
};

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

const textareaStyle = {
  ...selectStyle,
  height: "auto" as const,
  minHeight: 120,
  paddingBlock: 8,
  resize: "vertical" as const,
};

type CaptureMode = "written" | "transcript" | "audio" | "file";

export type CommitteeMeetingWorkspaceProps = {
  meetingId: string;
  committeeId: string;
};

function statusBadge(status: string): string {
  if (status === "ready") return "Published";
  if (status === "submitted") return "Ready to publish";
  if (status === "processing") return "Processing";
  if (status === "error") return "Error";
  return "Draft";
}

function ActionItemRow({
  item,
  people,
  onPatch,
  busy,
}: {
  item: MeetingActionItem;
  people: Array<{ id: string; full_name: string }>;
  onPatch: (id: string, patch: Record<string, unknown>) => Promise<void>;
  busy: boolean;
}) {
  const assigneeId = item.assignee_person_id ?? item.assignee?.id ?? "";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 160px 130px 120px",
        gap: 8,
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      <div>
        <Text size="sm" weight="semibold">
          {item.title}
        </Text>
        {item.description ? (
          <Text size="sm" color="secondary">
            {item.description}
          </Text>
        ) : null}
      </div>
      <select
        value={assigneeId}
        disabled={busy}
        onChange={(e) => {
          void onPatch(item.id, {
            assignee_person_id: e.target.value || null,
          });
        }}
        style={selectStyle}
      >
        <option value="">Unassigned</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={item.due_at?.slice(0, 10) ?? ""}
        disabled={busy}
        onChange={(e) => {
          void onPatch(item.id, { due_at: e.target.value || null });
        }}
        style={selectStyle}
      />
      <select
        value={item.status}
        disabled={busy}
        onChange={(e) => {
          void onPatch(item.id, { status: e.target.value as ActionItemStatus });
        }}
        style={selectStyle}
      >
        <option value="open">Open</option>
        <option value="done">Done</option>
        <option value="canceled">Canceled</option>
      </select>
    </div>
  );
}

export function CommitteeMeetingWorkspace({ meetingId }: CommitteeMeetingWorkspaceProps) {
  const {
    meeting,
    loading,
    error,
    patchMeeting: patchMeetingReal,
    postAgenda: postAgendaReal,
    submitMinutes: submitMinutesReal,
    publishMinutes: publishMinutesReal,
    transcribeAudio: transcribeAudioReal,
    uploadMinutesFile: uploadMinutesFileReal,
    refetch,
  } = useCommitteeMeetingById(meetingId);
  const { enabled: demo } = useDemoGuard();

  async function demoSkip(action: string, patch?: Record<string, unknown>) {
    if (patch && meetingId) {
      const { patchDemoEntity } = await import("@/lib/demo/demoStore");
      patchDemoEntity("committeeMeetings", meetingId, patch);
    }
    toast.success(`${action} — demo mode, saved locally only`);
  }

  const patchMeeting: typeof patchMeetingReal = (patch) =>
    demo
      ? demoSkip("Meeting updated", patch as Record<string, unknown>).then(() => undefined)
      : patchMeetingReal(patch);
  const postAgenda: typeof postAgendaReal = () =>
    demo ? demoSkip("Agenda posted", { agenda_posted: true }).then(() => undefined) : postAgendaReal();
  const submitMinutes: typeof submitMinutesReal = () =>
    demo
      ? demoSkip("Minutes generated", { minutes_status: "draft" }).then(() => undefined)
      : submitMinutesReal();
  const publishMinutes: typeof publishMinutesReal = (payload) =>
    demo
      ? demoSkip("Minutes published", { minutes_status: "published", ...(payload as object) }).then(
          () => undefined,
        )
      : publishMinutesReal(payload);
  const transcribeAudio: typeof transcribeAudioReal = (file) =>
    demo
      ? demoSkip("Audio transcribed", { audio_name: file.name }).then(() => undefined)
      : transcribeAudioReal(file);
  const uploadMinutesFile: typeof uploadMinutesFileReal = (file) =>
    demo
      ? demoSkip("File uploaded", { minutes_file: file.name }).then(() => undefined)
      : uploadMinutesFileReal(file);

  const {
    items: outstanding,
    patchActionItem: patchActionItemReal,
    createActionItem: createActionItemReal,
    refetch: refetchOutstanding,
  } = useOutstandingActionItems(meetingId);
  const patchActionItem: typeof patchActionItemReal = (id, patch) =>
    demo ? demoSkip("Action item updated") : patchActionItemReal(id, patch);
  const createActionItem: typeof createActionItemReal = (payload) =>
    demo ? demoSkip("Action item added") : createActionItemReal(payload);

  const { people } = usePeople({ autoFetch: true });
  const peopleOptions = useMemo(
    () =>
      (people ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name ?? p.email ?? p.id,
      })),
    [people],
  );

  const [agendaText, setAgendaText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [writtenMinutes, setWrittenMinutes] = useState("");
  const [captureMode, setCaptureMode] = useState<CaptureMode>("transcript");
  const [nextMeetingAt, setNextMeetingAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");

  useEffect(() => {
    if (!meeting) return;
    setAgendaText(agendaPlainText(meeting.agenda_json));
    setTranscript(meeting.raw_transcript ?? "");
    setWrittenMinutes(structuredMinutesToText(meeting.structured_minutes));
    if (meeting.minutes_source === "written") setCaptureMode("written");
    else if (meeting.minutes_source === "audio") setCaptureMode("audio");
    else if (meeting.minutes_source === "file") setCaptureMode("file");
    else setCaptureMode("transcript");
  }, [meeting]);

  const minutesEditable =
    meeting?.minutes_status === "draft" ||
    meeting?.minutes_status === "error" ||
    meeting?.minutes_status === "submitted";
  const isPublished = meeting?.minutes_status === "ready";

  const meetingActionItems: MeetingActionItem[] = useMemo(() => {
    const raw = meeting?.action_items ?? [];
    return raw.map((item) => ({
      ...item,
      assignee: item.assignee ?? item.people ?? null,
    }));
  }, [meeting]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      setMessage(label);
      await refetch();
      await refetchOutstanding();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <Text color="secondary">Loading meeting…</Text>;
  }
  if (error || !meeting) {
    return <Text color="secondary">{error ?? "Meeting not found"}</Text>;
  }

  const startsAt = meeting.events?.starts_at;
  const title =
    meeting.events?.name ??
    `Meeting ${startsAt ? new Date(startsAt).toLocaleDateString() : meeting.id.slice(0, 8)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Text weight="semibold" style={{ fontSize: 18 }}>
            {title}
          </Text>
          <Text size="sm" color="secondary">
            {startsAt
              ? new Date(startsAt).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Date TBD"}
            {meeting.location ? ` · ${meeting.location}` : ""}
          </Text>
        </div>
        <Badge label={statusBadge(meeting.minutes_status)} />
      </div>

      {message ? (
        <Text size="sm" color="secondary">
          {message}
        </Text>
      ) : null}
      {meeting.minutes_error ? (
        <Text size="sm" color="secondary">
          Error: {meeting.minutes_error}
        </Text>
      ) : null}

      {/* Agenda */}
      <section style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text weight="semibold">Agenda</Text>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              label="Save agenda"
              disabled={busy || !minutesEditable}
              onClick={() => {
                void run("Agenda saved", async () => {
                  await patchMeeting({ agenda_json: textToAgendaJson(agendaText) });
                });
              }}
            />
            <Button
              label="Post to Slack"
              variant="primary"
              disabled={busy}
              onClick={() => {
                void run("Agenda posted to Slack", async () => {
                  await patchMeeting({ agenda_json: textToAgendaJson(agendaText) });
                  await postAgenda();
                });
              }}
            />
          </div>
        </div>
        <textarea
          value={agendaText}
          onChange={(e) => setAgendaText(e.target.value)}
          disabled={!minutesEditable || busy}
          style={textareaStyle}
          rows={6}
          placeholder="Topics for this meeting…"
        />
      </section>

      {/* Outstanding / carryover */}
      <section style={sectionStyle}>
        <Text weight="semibold">Outstanding from previous meetings</Text>
        {outstanding.length === 0 ? (
          <Text size="sm" color="secondary">
            No open or canceled items from prior meetings.
          </Text>
        ) : (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 130px 120px",
                gap: 8,
                paddingBottom: 4,
              }}
            >
              <Text size="sm" color="secondary">
                Item
              </Text>
              <Text size="sm" color="secondary">
                Assignee
              </Text>
              <Text size="sm" color="secondary">
                Due
              </Text>
              <Text size="sm" color="secondary">
                Status
              </Text>
            </div>
            {outstanding.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                people={peopleOptions}
                busy={busy}
                onPatch={async (id, patch) => {
                  await run("Updated", async () => {
                    await patchActionItem(id, patch as Parameters<typeof patchActionItem>[1]);
                  });
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Capture minutes */}
      {!isPublished ? (
        <section style={sectionStyle}>
          <Text weight="semibold">Capture minutes</Text>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(
              [
                ["written", "Write"],
                ["transcript", "Transcript"],
                ["audio", "Audio"],
                ["file", "File"],
              ] as const
            ).map(([mode, label]) => (
              <Button
                key={mode}
                label={label}
                variant={captureMode === mode ? "primary" : "secondary"}
                onClick={() => setCaptureMode(mode)}
              />
            ))}
          </div>

          {captureMode === "written" ? (
            <>
              <textarea
                value={writtenMinutes}
                onChange={(e) => setWrittenMinutes(e.target.value)}
                disabled={!minutesEditable || busy}
                style={{ ...textareaStyle, minHeight: 180 }}
                rows={10}
                placeholder="Write meeting minutes… Use a line starting with # for headings."
              />
              <Button
                label="Save written minutes"
                variant="primary"
                disabled={busy || !writtenMinutes.trim()}
                onClick={() => {
                  void run("Written minutes saved", async () => {
                    await patchMeeting({
                      structured_minutes: textToStructuredMinutes(writtenMinutes),
                      minutes_source: "written",
                      minutes_status: "submitted",
                    });
                  });
                }}
              />
            </>
          ) : null}

          {captureMode === "transcript" ? (
            <>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                disabled={!minutesEditable || busy}
                style={{ ...textareaStyle, minHeight: 180 }}
                rows={10}
                placeholder="Paste the meeting transcript or notes…"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  label="Save transcript"
                  disabled={busy}
                  onClick={() => {
                    void run("Transcript saved", async () => {
                      await patchMeeting({
                        raw_transcript: transcript,
                        minutes_source: "transcript",
                      });
                    });
                  }}
                />
                <Button
                  label="Generate minutes (AI)"
                  variant="primary"
                  disabled={busy || !transcript.trim()}
                  onClick={() => {
                    void run("Minutes generated — review below", async () => {
                      await patchMeeting({
                        raw_transcript: transcript,
                        minutes_source: "transcript",
                      });
                      await submitMinutes();
                    });
                  }}
                />
              </div>
            </>
          ) : null}

          {captureMode === "audio" ? (
            <>
              <Text size="sm" color="secondary">
                Upload an audio recording (m4a, mp3, wav, webm — max 25MB). We&apos;ll transcribe it
                with Whisper, then you can generate minutes.
              </Text>
              {meeting.audio_url ? (
                <Text size="sm" color="secondary">
                  Current audio: {meeting.audio_url}
                </Text>
              ) : null}
              <input
                type="file"
                accept="audio/*,video/webm"
                disabled={busy || !minutesEditable}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void run("Audio transcribed", async () => {
                    await transcribeAudio(file);
                  });
                }}
              />
              {meeting.raw_transcript ? (
                <Button
                  label="Generate minutes from transcript"
                  variant="primary"
                  disabled={busy}
                  onClick={() => {
                    void run("Minutes generated — review below", async () => {
                      await submitMinutes();
                    });
                  }}
                />
              ) : null}
            </>
          ) : null}

          {captureMode === "file" ? (
            <>
              <Text size="sm" color="secondary">
                Upload a minutes document (TXT seeds the transcript; PDF/DOCX are stored as an
                attachment — paste or write a summary as needed).
              </Text>
              {meeting.minutes_attachment_url ? (
                <Text size="sm" color="secondary">
                  Attachment:{" "}
                  <a href={meeting.minutes_attachment_url} target="_blank" rel="noreferrer">
                    {meeting.minutes_attachment_url}
                  </a>
                </Text>
              ) : null}
              <input
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx,text/plain"
                disabled={busy || !minutesEditable}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void run("File uploaded", async () => {
                    await uploadMinutesFile(file);
                  });
                }}
              />
              <textarea
                value={writtenMinutes}
                onChange={(e) => setWrittenMinutes(e.target.value)}
                disabled={!minutesEditable || busy}
                style={{ ...textareaStyle, minHeight: 140 }}
                rows={6}
                placeholder="Optional: write or paste minutes text…"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  label="Save as written minutes"
                  disabled={busy || !writtenMinutes.trim()}
                  onClick={() => {
                    void run("Minutes saved", async () => {
                      await patchMeeting({
                        structured_minutes: textToStructuredMinutes(writtenMinutes),
                        minutes_source: "file",
                        minutes_status: "submitted",
                      });
                    });
                  }}
                />
                {meeting.raw_transcript ? (
                  <Button
                    label="Generate minutes (AI)"
                    variant="primary"
                    disabled={busy}
                    onClick={() => {
                      void run("Minutes generated — review below", async () => {
                        await submitMinutes();
                      });
                    }}
                  />
                ) : null}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {/* Review minutes + action items */}
      <section style={sectionStyle}>
        <Text weight="semibold">Review minutes</Text>
        {meeting.structured_minutes?.blocks?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {meeting.structured_minutes.blocks.map((block, i) => {
              if (block.kind === "heading") {
                return (
                  <Text key={i} weight="semibold">
                    {block.text}
                  </Text>
                );
              }
              if (block.kind === "list") {
                return (
                  <ul key={i} style={{ margin: 0, paddingLeft: 18 }}>
                    {block.items.map((item, j) => (
                      <li key={j}>
                        <Text size="sm">{item}</Text>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <Text key={i} size="sm">
                  {block.text}
                </Text>
              );
            })}
          </div>
        ) : (
          <Text size="sm" color="secondary">
            No structured minutes yet. Write them above or generate from a transcript.
          </Text>
        )}

        {minutesEditable && meeting.structured_minutes ? (
          <>
            <TextInput
              label="Edit minutes text"
              value={writtenMinutes}
              onChange={setWrittenMinutes}
              multiline
              rows={8}
            />
            <Button
              label="Update minutes"
              disabled={busy}
              onClick={() => {
                void run("Minutes updated", async () => {
                  await patchMeeting({
                    structured_minutes: textToStructuredMinutes(writtenMinutes),
                  });
                });
              }}
            />
          </>
        ) : null}
      </section>

      <section style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text weight="semibold">Action items</Text>
          <Text size="sm" color="secondary">
            Every open item must be assigned before publishing
          </Text>
        </div>
        {meetingActionItems.length === 0 ? (
          <Text size="sm" color="secondary">
            No action items yet.
          </Text>
        ) : (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 130px 120px",
                gap: 8,
                paddingBottom: 4,
              }}
            >
              <Text size="sm" color="secondary">
                Item
              </Text>
              <Text size="sm" color="secondary">
                Assignee
              </Text>
              <Text size="sm" color="secondary">
                Due
              </Text>
              <Text size="sm" color="secondary">
                Status
              </Text>
            </div>
            {meetingActionItems.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                people={peopleOptions}
                busy={busy || isPublished}
                onPatch={async (id, patch) => {
                  await run("Updated", async () => {
                    await patchActionItem(id, patch as Parameters<typeof patchActionItem>[1]);
                  });
                }}
              />
            ))}
          </div>
        )}

        {!isPublished ? (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <TextInput
                label="Add action item"
                value={newItemTitle}
                onChange={setNewItemTitle}
              />
            </div>
            <Button
              label="Add"
              disabled={busy || !newItemTitle.trim()}
              onClick={() => {
                void run("Action item added", async () => {
                  await createActionItem({
                    title: newItemTitle.trim(),
                    committee_meeting_id: meetingId,
                  });
                  setNewItemTitle("");
                });
              }}
            />
          </div>
        ) : null}
      </section>

      {/* Publish */}
      {!isPublished ? (
        <section style={sectionStyle}>
          <Text weight="semibold">Publish minutes</Text>
          <Text size="sm" color="secondary">
            Choose the next committee meeting date. Open action items without a due date will default
            to that day. A meeting is created if one doesn&apos;t already exist.
          </Text>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 280 }}>
            <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
              Next meeting
            </span>
            <input
              type="datetime-local"
              value={nextMeetingAt}
              onChange={(e) => setNextMeetingAt(e.target.value)}
              style={selectStyle}
            />
          </label>
          <Button
            label={busy ? "Publishing…" : "Approve & publish"}
            variant="primary"
            disabled={busy || !meeting.structured_minutes || !nextMeetingAt}
            onClick={() => {
              void run("Minutes published", async () => {
                await publishMinutes({
                  next_meeting_starts_at: new Date(nextMeetingAt).toISOString(),
                  next_location: meeting.location,
                  next_location_type: meeting.location_type,
                });
              });
            }}
          />
        </section>
      ) : (
        <section style={sectionStyle}>
          <Text weight="semibold">Published</Text>
          <Text size="sm" color="secondary">
            Minutes are live
            {meeting.website_slug ? ` (slug: ${meeting.website_slug})` : ""}.
          </Text>
        </section>
      )}
    </div>
  );
}
