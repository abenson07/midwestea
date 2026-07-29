"use client";

import { useState } from "react";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { VStack } from "@/components/patterns/primitives/Stack";
import { sampleCourses } from "@/data/mocks/courses";

function DescriptionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
        Description
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        style={{
          boxSizing: "border-box",
          width: "100%",
          paddingInline: 8,
          paddingBlock: 8,
          borderRadius: 6,
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          background: "var(--linear-color-canvas)",
          color: "var(--linear-color-ink)",
          fontSize: 13,
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
    </label>
  );
}

const seedCourse = sampleCourses[0];

/** Basic info settings for the generic Course settings page. */
export function CourseBasicInfoPanel() {
  const [name, setName] = useState(seedCourse.name);
  const [code, setCode] = useState(seedCourse.code);
  const [format, setFormat] = useState(seedCourse.format);
  const [price, setPrice] = useState(seedCourse.price);
  const [description, setDescription] = useState(seedCourse.description);

  return (
    <VStack gap={6}>
      <Heading level={1}>Basic info</Heading>
      <Text color="secondary">
        Fields shown to students on the catalog, checkout, and certificate pages.
      </Text>

      <Card padding={4}>
        <VStack gap={4}>
          <TextInput label="Course name" value={name} onChange={setName} />
          <TextInput label="Course code" value={code} onChange={setCode} />
          <TextInput label="Format" value={format} onChange={setFormat} />
          <TextInput label="Price" value={price} onChange={setPrice} />
          <DescriptionField value={description} onChange={setDescription} />
        </VStack>
      </Card>
    </VStack>
  );
}
