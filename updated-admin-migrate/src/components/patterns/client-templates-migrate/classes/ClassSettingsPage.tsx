"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { SettingsRow } from "@/components/patterns/client-templates-migrate/settings/SettingsRow";
import {
  SettingsCardList,
  settingsCardFieldStyle,
} from "@/components/patterns/client-templates-migrate/settings/SettingsCardList";
import { LocationSelect } from "@/components/patterns/client-templates-migrate/locations";
import {
  CATALOG_CLASS_TYPES,
  catalogKindForClass,
  isCatalogClassOnline,
  type CatalogClassType,
} from "../catalog/catalogMocks";
import { isClassOnline, type ClassDetail, type ClassExternalLink } from "./classMocks";

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

const lockedValueStyle: CSSProperties = {
  boxSizing: "border-box",
  width: 260,
  textAlign: "right",
};

function Divider() {
  return <div style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }} />;
}

export type ClassSettingsPageProps = {
  classDetail: ClassDetail;
  onSave: (next: ClassDetail) => void;
};

/** Class Settings — mirrors `CommitteeSettingsPage`'s details + publish sections. */
export function ClassSettingsPage({ classDetail, onSave }: ClassSettingsPageProps) {
  const [draft, setDraft] = useState(classDetail);
  const [saving, setSaving] = useState(false);
  const [editingPrereqId, setEditingPrereqId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(classDetail);
  }, [classDetail]);

  const prereqItems = draft.prerequisites.map((name, index) => ({
    id: `prereq-${index}`,
    name,
  }));
  const links = draft.externalLinks ?? [];
  const online = isCatalogClassOnline(draft.classFormat);
  const isCourse = catalogKindForClass(draft) === "Course";

  function patch(next: Partial<ClassDetail>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave(draft);
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
                label="Class name"
                control={<Text style={lockedValueStyle}>{draft.title}</Text>}
              />
              <Divider />
              <SettingsRow
                label="Class ID"
                description="Assigned when the class is created"
                control={<Text style={lockedValueStyle}>{draft.classCode}</Text>}
              />
              <Divider />
              <SettingsRow
                label="Course code"
                description="From the parent program/course template"
                control={<Text style={lockedValueStyle}>{draft.courseCode}</Text>}
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
                      patch({ classFormat: e.target.value as CatalogClassType })
                    }
                  >
                    {CATALOG_CLASS_TYPES.map((classType) => (
                      <option key={classType} value={classType}>
                        {classType}
                      </option>
                    ))}
                  </select>
                }
              />
              <Divider />
              <SettingsRow
                label="Online"
                description="Derived from Class Type"
                control={
                  <Text style={lockedValueStyle}>{isClassOnline(draft.classFormat) ? "Yes" : "No"}</Text>
                }
              />
              {!online ? (
                <>
                  <Divider />
                  <SettingsRow
                    label="Location"
                    control={
                      <LocationSelect
                        value={draft.location}
                        onChange={(location) => patch({ location })}
                        style={{ ...rowInputStyle, textAlign: "left" }}
                      />
                    }
                  />
                  <Divider />
                  <SettingsRow
                    label="Enrollment start"
                    control={
                      <input
                        type="date"
                        style={{ ...rowInputStyle, textAlign: "left" }}
                        value={draft.enrollmentStart}
                        onChange={(e) => patch({ enrollmentStart: e.target.value })}
                      />
                    }
                  />
                  <Divider />
                  <SettingsRow
                    label="Enrollment close"
                    control={
                      <input
                        type="date"
                        style={{ ...rowInputStyle, textAlign: "left" }}
                        value={draft.enrollmentClose}
                        onChange={(e) => patch({ enrollmentClose: e.target.value })}
                      />
                    }
                  />
                  <Divider />
                  <SettingsRow
                    label="Class start"
                    control={
                      <input
                        type="date"
                        style={{ ...rowInputStyle, textAlign: "left" }}
                        value={draft.classStart}
                        onChange={(e) => patch({ classStart: e.target.value })}
                      />
                    }
                  />
                  <Divider />
                  <SettingsRow
                    label="Class end"
                    control={
                      <input
                        type="date"
                        style={{ ...rowInputStyle, textAlign: "left" }}
                        value={draft.classEnd}
                        onChange={(e) => patch({ classEnd: e.target.value })}
                      />
                    }
                  />
                  <Divider />
                  <SettingsRow
                    label="Registration limit"
                    control={
                      <input
                        style={rowInputStyle}
                        value={draft.registrationLimit}
                        onChange={(e) => patch({ registrationLimit: e.target.value })}
                      />
                    }
                  />
                </>
              ) : null}
              <Divider />
              <SettingsRow
                label="Length of class"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.classLength}
                    onChange={(e) => patch({ classLength: e.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Certification length"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.certificationLength}
                    onChange={(e) => patch({ certificationLength: e.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Price"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.price}
                    onChange={(e) => patch({ price: e.target.value })}
                  />
                }
              />
              {!isCourse ? (
                <>
                  <Divider />
                  <SettingsRow
                    label="Registration fee"
                    control={
                      <input
                        style={rowInputStyle}
                        value={draft.registrationFee}
                        onChange={(e) => patch({ registrationFee: e.target.value })}
                      />
                    }
                  />
                </>
              ) : null}
            </VStack>
          </Card>
        </VStack>

        <SettingsCardList
          label="Prerequisites"
          addLabel="Add prerequisite"
          emptyLabel="No prerequisites yet."
          items={prereqItems}
          editingId={editingPrereqId}
          onEditingIdChange={setEditingPrereqId}
          onAdd={() => {
            const name = "New prerequisite";
            patch({ prerequisites: [...draft.prerequisites, name] });
            setEditingPrereqId(`prereq-${draft.prerequisites.length}`);
          }}
          onRemove={(id) => {
            const index = prereqItems.findIndex((item) => item.id === id);
            if (index < 0) return;
            patch({
              prerequisites: draft.prerequisites.filter((_, i) => i !== index),
            });
            setEditingPrereqId(null);
          }}
          getTitle={(item) => item.name}
          renderEditor={(item) => {
            const index = prereqItems.findIndex((row) => row.id === item.id);
            return (
              <input
                style={{ ...settingsCardFieldStyle, fontWeight: 510 }}
                value={item.name}
                onChange={(e) => {
                  const next = [...draft.prerequisites];
                  next[index] = e.target.value;
                  patch({ prerequisites: next });
                }}
                placeholder="Name"
              />
            );
          }}
        />

        <SettingsCardList
          label="External links"
          addLabel="Add link"
          emptyLabel="No external links yet."
          items={links}
          editingId={editingLinkId}
          onEditingIdChange={setEditingLinkId}
          onAdd={() => {
            const link: ClassExternalLink = {
              id: `link-${Date.now()}`,
              name: "New link",
              url: "",
            };
            patch({ externalLinks: [...links, link] });
            setEditingLinkId(link.id);
          }}
          onRemove={(id) => {
            patch({ externalLinks: links.filter((link) => link.id !== id) });
            setEditingLinkId(null);
          }}
          getTitle={(item) => item.name}
          getSubtitle={(item) => item.url}
          renderEditor={(item) => (
            <>
              <input
                style={{ ...settingsCardFieldStyle, fontWeight: 510 }}
                value={item.name}
                onChange={(e) =>
                  patch({
                    externalLinks: links.map((link) =>
                      link.id === item.id ? { ...link, name: e.target.value } : link,
                    ),
                  })
                }
                placeholder="Name"
              />
              <input
                style={settingsCardFieldStyle}
                value={item.url}
                onChange={(e) =>
                  patch({
                    externalLinks: links.map((link) =>
                      link.id === item.id ? { ...link, url: e.target.value } : link,
                    ),
                  })
                }
                placeholder="https://"
              />
            </>
          )}
        />

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
