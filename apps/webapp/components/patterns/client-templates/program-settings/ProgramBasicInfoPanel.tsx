"use client";

import { useState } from "react";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { VStack } from "@/components/patterns/primitives/Stack";
import { samplePrograms } from "@/data/mocks/programs";

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

const seedProgram = samplePrograms[0];

/** Basic info settings for the generic Program settings page. */
export function ProgramBasicInfoPanel() {
  const [name, setName] = useState(seedProgram.name);
  const [code, setCode] = useState(seedProgram.code);
  const [duration, setDuration] = useState(seedProgram.duration);
  const [tuition, setTuition] = useState(seedProgram.tuition);
  const [description, setDescription] = useState(seedProgram.description);

  return (
    <VStack gap={6}>
      <Heading level={1}>Basic info</Heading>
      <Text color="secondary">
        Fields shown to students on the catalog, enrollment, and invoice pages.
      </Text>

      <Card padding={4}>
        <VStack gap={4}>
          <TextInput label="Program name" value={name} onChange={setName} />
          <TextInput label="Program code" value={code} onChange={setCode} />
          <TextInput label="Duration" value={duration} onChange={setDuration} />
          <TextInput label="Tuition" value={tuition} onChange={setTuition} />
          <DescriptionField value={description} onChange={setDescription} />
        </VStack>
      </Card>
    </VStack>
  );
}
