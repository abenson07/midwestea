"use client";

import { useState } from "react";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading } from "@/components/patterns/primitives/Text";
import { Switch } from "@/components/patterns/primitives/Switch";
import { VStack } from "@/components/patterns/primitives/Stack";
import { SettingsRow } from "@/components/patterns/client-templates/settings";

function Divider() {
  return (
    <div
      style={{ height: 1, background: "var(--color-border)", marginInline: -16 }}
    />
  );
}

/** General settings for the generic Course settings page. */
export function CourseGeneralPanel() {
  const [published, setPublished] = useState(true);
  const [acceptingEnrollment, setAcceptingEnrollment] = useState(true);
  const [featured, setFeatured] = useState(false);

  return (
    <VStack gap={6}>
      <Heading level={1}>General</Heading>

      <Card padding={4}>
        <VStack gap={4}>
          <SettingsRow
            label="Published"
            description="Make this course visible to students on MidwestEA.com"
            control={
              <Switch
                label="Published"
                isLabelHidden
                value={published}
                onChange={setPublished}
              />
            }
          />
          <Divider />
          <SettingsRow
            label="Accepting enrollment"
            description="Allow new students to purchase and take this course"
            control={
              <Switch
                label="Accepting enrollment"
                isLabelHidden
                value={acceptingEnrollment}
                onChange={setAcceptingEnrollment}
              />
            }
          />
          <Divider />
          <SettingsRow
            label="Featured on website"
            description="Highlight this course on the MidwestEA.com homepage"
            control={
              <Switch
                label="Featured on website"
                isLabelHidden
                value={featured}
                onChange={setFeatured}
              />
            }
          />
        </VStack>
      </Card>
    </VStack>
  );
}
