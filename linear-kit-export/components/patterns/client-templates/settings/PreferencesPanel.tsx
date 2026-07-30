"use client";

import { useState } from "react";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Switch } from "@astryxdesign/core/Switch";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { SettingsRow } from "./SettingsRow";

function Divider() {
  return (
    <div
      style={{ height: 1, background: "var(--color-border)", marginInline: -16 }}
    />
  );
}

/**
 * Preferences settings panel — General + Interface and theme sections,
 * matching the reference screenshot. The one fully-built panel for this
 * pass; every other nav item renders `SettingsPlaceholderPanel`.
 */
export function PreferencesPanel() {
  const [convertEmoticons, setConvertEmoticons] = useState(true);
  const [pointerCursors, setPointerCursors] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);

  return (
    <VStack gap={6}>
      <Heading level={1}>Preferences</Heading>

      <VStack gap={3}>
        <Text type="label" color="secondary">
          General
        </Text>
        <Card padding={4}>
          <VStack gap={4}>
            <SettingsRow
              label="Default home view"
              description="Select which view to display when launching Linear"
              control={<Text color="secondary">Linear Agent (default)</Text>}
            />
            <Divider />
            <SettingsRow
              label="Display names"
              description="Select how names are displayed in the Linear interface"
              control={<Text color="secondary">Username</Text>}
            />
            <Divider />
            <SettingsRow
              label="First day of the week"
              description="Used for date pickers"
              control={<Text color="secondary">Sunday</Text>}
            />
            <Divider />
            <SettingsRow
              label="Convert text emoticons into emojis"
              description="Strings like :) will be converted to 🙂"
              control={
                <Switch
                  label="Convert text emoticons into emojis"
                  isLabelHidden
                  value={convertEmoticons}
                  onChange={setConvertEmoticons}
                />
              }
            />
            <Divider />
            <SettingsRow
              label="Send comments on..."
              description="Choose which key press is used to submit comments"
              control={<Text color="secondary">⌘+Enter</Text>}
            />
          </VStack>
        </Card>
      </VStack>

      <VStack gap={3}>
        <Text type="label" color="secondary">
          Interface and theme
        </Text>
        <Card padding={4}>
          <VStack gap={4}>
            <SettingsRow
              label="App sidebar"
              description="Customize sidebar item visibility, ordering, and badge style"
              control={<Text color="secondary">Customize</Text>}
            />
            <Divider />
            <SettingsRow
              label="Font size"
              description="Adjust the size of text across the app"
              control={<Text color="secondary">Default</Text>}
            />
            <Divider />
            <SettingsRow
              label="Use pointer cursors"
              description="Change the cursor to a pointer when hovering over any interactive elements"
              control={
                <Switch
                  label="Use pointer cursors"
                  isLabelHidden
                  value={pointerCursors}
                  onChange={setPointerCursors}
                />
              }
            />
            <Divider />
            <SettingsRow
              label="Underline links"
              description="Always underline links in text content"
              control={
                <Switch
                  label="Underline links"
                  isLabelHidden
                  value={underlineLinks}
                  onChange={setUnderlineLinks}
                />
              }
            />
            <Divider />
            <SettingsRow
              label="Interface theme"
              description="Select or customize your interface color scheme"
              control={<Text color="secondary">Classic Dark</Text>}
            />
          </VStack>
        </Card>
      </VStack>
    </VStack>
  );
}
