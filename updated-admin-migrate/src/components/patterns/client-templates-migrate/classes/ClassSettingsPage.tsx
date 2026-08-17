"use client";

import { useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { SettingsRow } from "@/components/patterns/client-templates-migrate/settings/SettingsRow";
import type { ClassDetail } from "./classMocks";

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

function Divider() {
  return <div style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }} />;
}

export type ClassSettingsPageProps = {
  classDetail: ClassDetail;
};

/** Class Settings — mirrors `CommitteeSettingsPage`'s details + publish sections. */
export function ClassSettingsPage({ classDetail }: ClassSettingsPageProps) {
  const [draft, setDraft] = useState(classDetail);
  const [saving, setSaving] = useState(false);

  function patch(next: Partial<ClassDetail>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSaving(false);
    toast.success("Class settings saved — demo mode, saved locally only");
  }

  const isPublished = draft.publishStatus === "published";

  return (
    <div style={{ maxWidth: 760, marginInline: "auto", padding: "48px 24px 64px" }}>
      <VStack gap={8}>
        <Heading level={1}>Class settings</Heading>

        <VStack gap={3}>
          <Text type="label" color="secondary">
            Class details
          </Text>
          <Card padding={4}>
            <VStack gap={4}>
              <SettingsRow
                label="Class title"
                description="Shown in the admin and on the website"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.title}
                    onChange={(e) => patch({ title: e.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Instructor"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.instructor}
                    onChange={(e) => patch({ instructor: e.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Location"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.location}
                    onChange={(e) => patch({ location: e.target.value })}
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
                    Public summary of the class
                  </Text>
                </VStack>
                <textarea
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
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
                  ? "This class page is visible on the website"
                  : "This class page is not published yet"
              }
              control={
                <Button
                  label={isPublished ? "Unpublish" : "Publish"}
                  variant={isPublished ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => patch({ publishStatus: isPublished ? "draft" : "published" })}
                />
              }
            />
          </Card>
        </VStack>

        <div>
          <Button
            label={saving ? "Saving…" : "Save changes"}
            variant="primary"
            disabled={saving}
            onClick={() => void handleSave()}
          />
        </div>
      </VStack>
    </div>
  );
}
