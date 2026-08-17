"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";
import { looksLikeEmail } from "@/lib/committees/looksLikeEmail";
import type { CommitteeInterests } from "@/types/database";

export type InterestResponseModalProps = {
  interest: CommitteeInterests | null;
  onClose: () => void;
  onSend: (payload: { subject: string; text: string }) => Promise<void>;
  onMarkHandled: () => Promise<void>;
};

function defaultSubject(interest: CommitteeInterests): string {
  if (interest.opportunity_title) {
    return `Re: ${interest.opportunity_title} — Maple Leaf Community Council`;
  }
  return "Thanks for reaching out — Maple Leaf Community Council";
}

function defaultBody(interest: CommitteeInterests): string {
  return [
    `Hi ${interest.name},`,
    "",
    "Thanks for getting in touch with the Maple Leaf Community Council.",
    "",
    "",
    "",
    "Best,",
    "Maple Leaf Community Council",
    "hello@mapleleafcommunity.org",
  ].join("\n");
}

export function InterestResponseModal({
  interest,
  onClose,
  onSend,
  onMarkHandled,
}: InterestResponseModalProps) {
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interest) return;
    setSubject(defaultSubject(interest));
    setText(defaultBody(interest));
    setError(null);
  }, [interest]);

  if (!interest) return null;

  const canEmail = looksLikeEmail(interest.contact);

  async function handleSend() {
    if (!interest || !subject.trim() || !text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSend({ subject: subject.trim(), text: text.trim() });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMark() {
    if (!interest) return;
    setSubmitting(true);
    setError(null);
    try {
      await onMarkHandled();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark handled");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={interest != null}
      onClose={onClose}
      title={canEmail ? "Email response" : "Mark as handled"}
      width={520}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          {!canEmail ? (
            <Button
              label={submitting ? "Saving…" : "Mark handled"}
              variant="primary"
              onClick={() => {
                if (!submitting) void handleMark();
              }}
            />
          ) : (
            <>
              <Button
                label="Mark handled (no email)"
                variant="ghost"
                onClick={() => {
                  if (!submitting) void handleMark();
                }}
              />
              <Button
                label={submitting ? "Sending…" : "Send email"}
                variant="primary"
                onClick={() => {
                  if (!submitting && subject && text) void handleSend();
                }}
              />
            </>
          )}
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text size="sm" color="secondary">
          To: {interest.contact}
          {canEmail ? " · From / Reply-To: hello@mapleleafcommunity.org" : " (not an email)"}
        </Text>
        {canEmail ? (
          <>
            <TextInput label="Subject" value={subject} onChange={setSubject} />
            <TextInput label="Message" value={text} onChange={setText} multiline rows={10} />
          </>
        ) : (
          <Text size="sm" color="secondary">
            This contact is a phone number. Reach out directly, then mark it handled so others know
            it&apos;s covered.
          </Text>
        )}
        {error ? (
          <Text size="sm" style={{ color: "#eb5757" }}>
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}
