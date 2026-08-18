"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { SettingsRow } from "@/components/patterns/client-templates-migrate/settings/SettingsRow";
import {
  SettingsCardList,
  settingsCardFieldStyle,
} from "@/components/patterns/client-templates-migrate/settings/SettingsCardList";
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
    setDraft(template);
  }, [template]);

  const links = draft.externalLinks ?? [];

  function patch(next: Partial<CatalogTemplate>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave(draft);
    setSaving(false);
    toast.success(`${draft.kind} details saved — demo mode, saved locally only`);
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
                label="Description"
                control={
                  <input
                    style={rowInputStyle}
                    value={draft.description}
                    onChange={(e) => patch({ description: e.target.value })}
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
