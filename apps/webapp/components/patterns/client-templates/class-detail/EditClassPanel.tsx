"use client";

import { useState } from "react";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Switch } from "@/components/patterns/primitives/Switch";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Heading } from "@/components/patterns/primitives/Text";
import type { ClassSummary } from "@/data/mocks/class-detail";

export type EditClassPanelProps = {
  summary: ClassSummary;
  onSave: (next: ClassSummary) => void;
};

type FormState = {
  program: string;
  name: string;
  courseCode: string;
  isOnline: boolean;
  location: string;
  enrollmentStartDate: string;
  enrollmentCloseDate: string;
  classStartDate: string;
  classEndDate: string;
  lengthOfClass: string;
  registrationLimit: string;
  certificationLength: string;
  price: string;
  registrationFee: string;
};

function toFormState(summary: ClassSummary): FormState {
  return {
    program: summary.program,
    name: summary.name,
    courseCode: summary.courseCode,
    isOnline: summary.isOnline,
    location: summary.location,
    enrollmentStartDate: summary.enrollmentStartDate,
    enrollmentCloseDate: summary.enrollmentCloseDate,
    classStartDate: summary.classStartDate,
    classEndDate: summary.classEndDate,
    lengthOfClass: summary.lengthOfClass,
    registrationLimit: String(summary.registrationLimit),
    certificationLength: String(summary.certificationLength),
    price: summary.price,
    registrationFee: summary.registrationFee,
  };
}

/** Editable class-details form — outlined side panel opened from "Edit class". */
export function EditClassPanel({ summary, onSave }: EditClassPanelProps) {
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
      location: form.location,
      enrollmentStartDate: form.enrollmentStartDate,
      enrollmentCloseDate: form.enrollmentCloseDate,
      classStartDate: form.classStartDate,
      classEndDate: form.classEndDate,
      lengthOfClass: form.lengthOfClass,
      registrationLimit: Number(form.registrationLimit) || summary.registrationLimit,
      certificationLength: Number(form.certificationLength) || summary.certificationLength,
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
          <TextInput label="Location" value={form.location} onChange={(v) => set("location", v)} />
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
            label="Class Start Date"
            value={form.classStartDate}
            onChange={(v) => set("classStartDate", v)}
          />
          <TextInput
            label="Class End Date"
            value={form.classEndDate}
            onChange={(v) => set("classEndDate", v)}
          />
          <TextInput
            label="Length of Class"
            value={form.lengthOfClass}
            onChange={(v) => set("lengthOfClass", v)}
          />
          <TextInput
            label="Registration Limit"
            value={form.registrationLimit}
            onChange={(v) => set("registrationLimit", v)}
          />
          <TextInput
            label="Certification Length"
            value={form.certificationLength}
            onChange={(v) => set("certificationLength", v)}
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
