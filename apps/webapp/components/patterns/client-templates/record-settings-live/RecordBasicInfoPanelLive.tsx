"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { VStack } from "@/components/patterns/primitives/Stack";
import { getCourseById, type Course } from "@/lib/classes";
import { saveCourseRecord } from "@/lib/settings-live";

export type RecordBasicInfoPanelLiveProps = {
  recordLabel: "Program" | "Course";
  referenceType: "program" | "course";
  records: Course[];
  loadingRecords: boolean;
};

const PROGRAMMING_OFFERINGS = [
  "In Person Only",
  "Hybrid",
  "Online + Skills Training",
  "In Person + Homework",
  "Online Only",
];

/**
 * Real basic-info editor for a program/course record — same fields and save
 * path as `/admin/programs/[id]`'s Edit panel, minus the classes/waitlist
 * section (settings pages only manage the record itself).
 */
export function RecordBasicInfoPanelLive({
  recordLabel,
  referenceType,
  records,
  loadingRecords,
}: RecordBasicInfoPanelLiveProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [record, setRecord] = useState<Course | null>(null);
  const [original, setOriginal] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedId && records.length > 0) {
      setSelectedId(records[0].id);
    }
  }, [records, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setSaved(false);
      const { course, error: fetchError } = await getCourseById(selectedId);
      if (cancelled) return;
      if (fetchError) setError(fetchError);
      else if (course) {
        setRecord(course);
        setOriginal({ ...course });
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleSave() {
    if (!record || !original) return;
    setSaving(true);
    setError("");
    const { success, error: saveError } = await saveCourseRecord(record, original, referenceType);
    if (success) {
      setOriginal({ ...record });
      setSaved(true);
    } else {
      setError(saveError || "Failed to save");
    }
    setSaving(false);
  }

  const isOnlineOnly =
    record?.programming_offering === "Online Only" ||
    record?.programming_offering === "Online + Skills Training";

  return (
    <VStack gap={6}>
      <Heading level={1}>Basic info</Heading>
      <Text color="secondary">
        Fields shown to students on the catalog, enrollment, and invoice pages.
      </Text>

      <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{recordLabel}</span>
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          disabled={loadingRecords}
          style={{
            boxSizing: "border-box",
            width: "100%",
            padding: "8px",
            borderRadius: 6,
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            background: "var(--linear-color-canvas)",
            color: "var(--linear-color-ink)",
            fontSize: 13,
          }}
        >
          {records.map((item) => (
            <option key={item.id} value={item.id}>
              {item.course_code} · {item.course_name}
            </option>
          ))}
        </select>
      </label>

      {error ? <Text color="secondary">{error}</Text> : null}

      {loading || !record ? (
        <Text color="secondary">Loading…</Text>
      ) : (
        <Card padding={4}>
          <VStack gap={4}>
            <TextInput
              label={`${recordLabel} name`}
              value={record.course_name}
              onChange={(value) => setRecord({ ...record, course_name: value })}
            />
            <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
              <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                {recordLabel} code
              </span>
              <span
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  paddingInline: 8,
                  borderRadius: 6,
                  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                  background: "var(--linear-color-sidebar-item-selected)",
                  color: "var(--linear-color-ink-subtle)",
                  fontSize: 13,
                }}
              >
                {record.course_code}
              </span>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
              <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Class type</span>
              <select
                value={record.programming_offering ?? ""}
                onChange={(event) =>
                  setRecord({ ...record, programming_offering: event.target.value || null })
                }
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  padding: "8px",
                  borderRadius: 6,
                  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                  background: "var(--linear-color-canvas)",
                  color: "var(--linear-color-ink)",
                  fontSize: 13,
                }}
              >
                <option value="">Select class type…</option>
                {PROGRAMMING_OFFERINGS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {!isOnlineOnly ? (
              <TextInput
                label="Length of class"
                value={record.length_of_class ?? ""}
                onChange={(value) => setRecord({ ...record, length_of_class: value })}
              />
            ) : null}

            <TextInput
              label="Certification length (months)"
              value={record.certification_length != null ? String(record.certification_length) : ""}
              onChange={(value) =>
                setRecord({ ...record, certification_length: value ? parseInt(value, 10) : null })
              }
            />
            <TextInput
              label="Registration limit"
              value={record.registration_limit != null ? String(record.registration_limit) : ""}
              onChange={(value) =>
                setRecord({ ...record, registration_limit: value ? parseInt(value, 10) : null })
              }
            />
            <TextInput
              label="Price ($)"
              value={record.price != null ? (record.price / 100).toFixed(2) : ""}
              onChange={(value) =>
                setRecord({ ...record, price: value ? Math.round(parseFloat(value) * 100) : null })
              }
            />
            <TextInput
              label="Registration fee ($)"
              value={record.registration_fee != null ? (record.registration_fee / 100).toFixed(2) : ""}
              onChange={(value) =>
                setRecord({
                  ...record,
                  registration_fee: value ? Math.round(parseFloat(value) * 100) : null,
                })
              }
            />
            <TextInput
              label="Course image URL"
              value={record.course_image ?? ""}
              onChange={(value) => setRecord({ ...record, course_image: value || null })}
            />

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                alignSelf: "flex-start",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "var(--linear-color-accent, #5e6ad2)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
            </button>
          </VStack>
        </Card>
      )}
    </VStack>
  );
}
