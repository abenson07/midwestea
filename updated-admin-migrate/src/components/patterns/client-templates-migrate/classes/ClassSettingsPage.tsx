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
                label="Registration Fee"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.registrationFee}
                    onChange={(e) => patch({ registrationFee: e.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Tuition Fee"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.tuitionFee}
                    onChange={(e) => patch({ tuitionFee: e.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Class Size"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.classSize}
                    onChange={(e) => patch({ classSize: e.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Class Type"
                control={
                  <select
                    style={{ ...rowInputStyle, textAlign: "left" }}
                    value={draft.classFormat}
                    aria-label="Class type"
                    onChange={(e) =>
                      patch({ classFormat: e.target.value as ClassDetail["classFormat"] })
                    }
                  >
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="In-person">In-person</option>
                  </select>
                }
              />
              <Divider />
              <SettingsRow
                label="Prerequisites"
                description={
                  draft.prerequisites.length
                    ? `${draft.prerequisites.length} required`
                    : "None"
                }
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.prerequisites.join(", ")}
                    onChange={(e) =>
                      patch({
                        prerequisites: e.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Dates"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.date}
                    onChange={(e) => patch({ date: e.target.value })}
                  />
                }
              />
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
