"use client";

import { useState } from "react";
import { Mail, Share2 } from "lucide-react";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { MobileBottomSheet } from "./MobileBottomSheet";
import {
  mobileEmptyStyle,
  mobileHeaderStyle,
  mobilePageStyle,
  mobilePrimaryBtnStyle,
  mobileScrollStyle,
  mobileSecondaryBtnStyle,
  mobileTitleStyle,
} from "./mobileStyles";

type ComposeKind = "email" | "social" | null;

export function MobilePromotionsPage() {
  const { enabled: demo } = useDemoModeOptional();
  const [compose, setCompose] = useState<ComposeKind>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  function resetCompose() {
    setSubject("");
    setBody("");
    setStatus(null);
    setCompose(null);
  }

  function submit() {
    if (!body.trim()) {
      setStatus("Add some content first.");
      return;
    }
    if (compose === "email" && !subject.trim()) {
      setStatus("Subject is required for email.");
      return;
    }
    setStatus(
      compose === "email"
        ? "Email draft saved locally — send API not connected yet."
        : "Social post draft saved locally — publish API not connected yet.",
    );
  }

  return (
    <div style={mobilePageStyle}>
      <header style={mobileHeaderStyle}>
        <h1 style={mobileTitleStyle}>Promotions</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>
          {demo ? "Spin up a quick email or social post" : "Promotions not connected yet"}
        </p>
      </header>

      {!demo ? (
        <div style={{ ...mobileScrollStyle, padding: 16 }}>
          <EmptyStateCard
            variant="plain"
            label="Promotions not connected — turn on demo mode to preview"
          />
        </div>
      ) : (
        <div style={{ ...mobileScrollStyle, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            type="button"
            onClick={() => {
              setStatus(null);
              setCompose("email");
            }}
            style={{
              ...mobileSecondaryBtnStyle,
              height: "auto",
              minHeight: 72,
              justifyContent: "flex-start",
              padding: 16,
              gap: 14,
            }}
          >
            <Mail size={22} strokeWidth={1.75} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>New email</div>
              <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)", marginTop: 2 }}>
                Draft a blast or update
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatus(null);
              setCompose("social");
            }}
            style={{
              ...mobileSecondaryBtnStyle,
              height: "auto",
              minHeight: 72,
              justifyContent: "flex-start",
              padding: 16,
              gap: 14,
            }}
          >
            <Share2 size={22} strokeWidth={1.75} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>New social post</div>
              <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)", marginTop: 2 }}>
                Quick caption for Instagram / Facebook
              </div>
            </div>
          </button>

          <div style={{ ...mobileEmptyStyle, paddingTop: 24 }}>
            Drafts aren&apos;t synced yet — compose here for on-the-go copy.
          </div>
        </div>
      )}

      <MobileBottomSheet
        open={compose != null}
        onClose={resetCompose}
        title={compose === "email" ? "New email" : "New social post"}
        size="tall"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {compose === "email" ? (
            <TextInput label="Subject" value={subject} onChange={setSubject} />
          ) : null}
          <TextInput
            label={compose === "email" ? "Body" : "Caption"}
            value={body}
            onChange={setBody}
            multiline
            rows={8}
          />
          {status ? (
            <div style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>{status}</div>
          ) : null}
          <button type="button" style={mobilePrimaryBtnStyle} onClick={submit}>
            {compose === "email" ? "Save email draft" : "Save social draft"}
          </button>
        </div>
      </MobileBottomSheet>
    </div>
  );
}
