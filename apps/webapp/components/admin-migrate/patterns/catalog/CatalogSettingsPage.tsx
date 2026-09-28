"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { createSupabaseClient } from "@midwestea/utils";
import { Card } from "@/components/admin-migrate/patterns/primitives/Card";
import { Heading, Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { VStack } from "@/components/admin-migrate/patterns/primitives/Stack";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { SettingsRow } from "@/components/admin-migrate/patterns/settings/SettingsRow";
import {
  SettingsCardList,
  settingsCardFieldStyle,
} from "@/components/admin-migrate/patterns/settings/SettingsCardList";
import { parseDisplayCents, parseLeadingInt } from "@/lib/admin-migrate/display-parsers";
import { updateCourseExternalLinks } from "@/lib/classes";
import type { ClassExternalLink } from "../classes/classMocks";
import {
  CATALOG_CLASS_TYPES,
  isCatalogClassOnline,
  type CatalogClassType,
  type CatalogTemplate,
} from "./catalogMocks";

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

export type CatalogSettingsPageProps = {
  template: CatalogTemplate;
  onSave: (next: CatalogTemplate) => void;
};

/** Template settings — mirrors `ClassSettingsPage`'s details card. */
export function CatalogSettingsPage({ template, onSave }: CatalogSettingsPageProps) {
  const [draft, setDraft] = useState(template);
  const [saving, setSaving] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fill a sensible certificate-reminder default when unset: the
    // closest clean numeric proxy for "how far ahead to warn" is the
    // certification's own validity length plus a month of buffer —
    // certification_length is a real numeric column, unlike the freeform
    // length_of_class text field. Admin can override from here.
    if (template.certificateReminderMonths == null) {
      const certYears = parseLeadingInt(template.certificationLength);
      setDraft({
        ...template,
        certificateReminderMonths: certYears != null ? certYears * 12 + 1 : null,
      });
    } else {
      setDraft(template);
    }
  }, [template]);

  const links = draft.externalLinks ?? [];

  function patch(next: Partial<CatalogTemplate>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = await createSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Not signed in — please log in again.");
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/courses/${draft.id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          courseName: draft.name,
          programmingOffering: draft.defaultClassFormat,
          courseImage: draft.courseImageUrl || null,
          lengthOfClass: draft.classLength === "—" ? null : draft.classLength,
          certificationLength: parseLeadingInt(draft.certificationLength),
          certificateReminderMonths: draft.certificateReminderMonths ?? null,
          registrationLimit: parseLeadingInt(draft.registrationLimit),
          price: parseDisplayCents(draft.price),
          registrationFee: draft.kind !== "Course" ? parseDisplayCents(draft.registrationFee) : undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to save — please try again.");
        setSaving(false);
        return;
      }

      const linksResult = await updateCourseExternalLinks(
        draft.id,
        draft.jbLearningUrl ? "JB Learning" : null,
        draft.jbLearningUrl || null,
        draft.platinumEdUrl ? "Platinum ED" : null,
        draft.platinumEdUrl || null
      );
      if (!linksResult.success) {
        toast.error(linksResult.error || "Saved details, but failed to save learning platform links.");
        setSaving(false);
        return;
      }

      onSave(draft);
      toast.success(`${draft.kind} details saved`);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to save — please try again.");
    } finally {
      setSaving(false);
    }
  }

  const siteHref = `https://midwestea.example/${draft.kind === "Program" ? "programs" : "courses"}/${draft.code.toLowerCase()}`;

  return (
    <div style={{ maxWidth: 760, marginInline: "auto", padding: "48px 24px 64px" }}>
      <VStack gap={8}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Heading level={1}>{draft.kind} settings</Heading>
          <Button
            label="View on site"
            variant="secondary"
            size="sm"
            icon={<ExternalLink size={14} strokeWidth={1.75} />}
            onClick={() => window.open(siteHref, "_blank", "noopener,noreferrer")}
          />
        </div>

        <VStack gap={3}>
          <Text type="label" color="secondary">
            {draft.kind} details
          </Text>
          <Card padding={4}>
            <VStack gap={4}>
              <SettingsRow
                label="Name"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Code"
                description="Classes created from this template use this code"
                control={<Text style={lockedValueStyle}>{draft.code}</Text>}
              />
              <Divider />
              <SettingsRow
                label="Type"
                control={<Text style={lockedValueStyle}>{draft.kind}</Text>}
              />
              <Divider />
              <SettingsRow
                label="Default class format"
                control={
                  <select
                    style={{ ...rowInputStyle, textAlign: "left" }}
                    value={draft.defaultClassFormat}
                    aria-label="Default class format"
                    onChange={(e) =>
                      patch({
                        defaultClassFormat: e.target.value as CatalogClassType,
                      })
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
              {!isCatalogClassOnline(draft.defaultClassFormat) ? (
                <>
                  <Divider />
                  <SettingsRow
                    label="Default location"
                    control={
                      <input
                        style={rowInputStyle}
                        value={draft.defaultLocation}
                        onChange={(e) => patch({ defaultLocation: e.target.value })}
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
                label="Registration limit"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.registrationLimit}
                    onChange={(e) => patch({ registrationLimit: e.target.value })}
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
                label="Certification reminder"
                description="Months before expiration to remind the student (sending isn't wired up yet — this just saves the setting)"
                control={
                  <input
                    type="number"
                    min={0}
                    style={rowInputStyle}
                    value={draft.certificateReminderMonths ?? ""}
                    onChange={(e) =>
                      patch({
                        certificateReminderMonths: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
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
              {draft.kind !== "Course" ? (
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
              <Divider />
              <SettingsRow
                label="JB Learning URL"
                description="Leave blank to hide this link for students — no generic fallback is shown"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.jbLearningUrl ?? ""}
                    placeholder="https://"
                    onChange={(e) => patch({ jbLearningUrl: e.target.value || null })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Platinum ED URL"
                description="Leave blank to hide this link for students — no generic fallback is shown"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.platinumEdUrl ?? ""}
                    placeholder="https://"
                    onChange={(e) => patch({ platinumEdUrl: e.target.value || null })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Course image URL"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.courseImageUrl ?? ""}
                    placeholder="https://"
                    onChange={(e) => patch({ courseImageUrl: e.target.value })}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Stripe Product ID"
                description="Assigned when the template is created"
                control={<Text style={lockedValueStyle}>{draft.stripeProductId || "Not set"}</Text>}
              />
            </VStack>
          </Card>
        </VStack>

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
