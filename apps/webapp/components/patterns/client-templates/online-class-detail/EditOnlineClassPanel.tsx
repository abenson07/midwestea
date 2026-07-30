"use client";

import { useState } from "react";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Switch } from "@/components/patterns/primitives/Switch";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Heading } from "@/components/patterns/primitives/Text";
import type { OnlineClassSummary } from "@/data/mocks/online-class-detail";

export type EditOnlineClassPanelProps = {
  summary: OnlineClassSummary;
  onSave: (next: OnlineClassSummary) => void;
};

type FormState = {
  program: string;
  name: string;
  courseCode: string;
  isOnline: boolean;
  enrollmentStartDate: string;
  enrollmentCloseDate: string;
  registrationLimit: string;
  price: string;
  registrationFee: string;
};

function toFormState(summary: OnlineClassSummary): FormState {
  return {
    program: summary.program,
    name: summary.name,
    courseCode: summary.courseCode,
    isOnline: summary.isOnline,
    enrollmentStartDate: summary.enrollmentStartDate,
    enrollmentCloseDate: summary.enrollmentCloseDate,
    registrationLimit: String(summary.registrationLimit),
    price: summary.price,
    registrationFee: summary.registrationFee,
  };
}

/**
 * Editable class-details form for an online class. No location or class
 * session dates — those collapse into a single "Online" toggle.
 */
export function EditOnlineClassPanel({ summary, onSave }: EditOnlineClassPanelProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(summary));

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSave({
      ...summary,
      program: form.program,
      name: form.name,
      courseCode: form.courseCode,
      isOnline: form.isOnline,
      enrollmentStartDate: form.enrollmentStartDate,
      enrollmentCloseDate: form.enrollmentCloseDate,
      registrationLimit: Number(form.registrationLimit) || summary.registrationLimit,
      price: form.price,
      registrationFee: form.registrationFee,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ marginBottom: 12, flexShrink: 0 }}>
        <Heading level={2}>Edit class</Heading>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <VStack gap={4}>
          <TextInput label="Class Name" value={form.program} onChange={(v) => set("program", v)} />
          <TextInput label="Class ID" value={form.name} onChange={(v) => set("name", v)} />
          <TextInput
            label="Course Code"
            value={form.courseCode}
            onChange={(v) => set("courseCode", v)}
          />
          <Switch label="Online" value={form.isOnline} onChange={(v) => set("isOnline", v)} />
          <TextInput
            label="Enrollment Start"
            value={form.enrollmentStartDate}
            onChange={(v) => set("enrollmentStartDate", v)}
          />
          <TextInput
            label="Enrollment Close"
            value={form.enrollmentCloseDate}
            onChange={(v) => set("enrollmentCloseDate", v)}
          />
          <TextInput
            label="Registration Limit"
            value={form.registrationLimit}
            onChange={(v) => set("registrationLimit", v)}
          />
          <TextInput label="Price" value={form.price} onChange={(v) => set("price", v)} />
          <TextInput
            label="Registration Fee"
            value={form.registrationFee}
            onChange={(v) => set("registrationFee", v)}
          />
        </VStack>
      </div>

      <div style={{ paddingTop: 12, flexShrink: 0 }}>
        <Button label="Save" variant="primary" size="md" width="100%" onClick={handleSave} />
      </div>
    </div>
  );
}
