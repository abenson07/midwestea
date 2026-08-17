"use client";

import { useState, type CSSProperties } from "react";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { useThemeMode, type ThemeMode } from "@/components/patterns/foundation/ThemeContext";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import {
  HOME_VIEW_OPTIONS,
  isHomeViewId,
  readHomeView,
  writeHomeView,
  type HomeViewId,
} from "@/lib/preferences/homeView";
import { SettingsRow } from "./SettingsRow";

const selectStyle: CSSProperties = {
  boxSizing: "border-box",
  width: 220,
  height: 30,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

function Divider() {
  return <div style={{ height: 1, background: "var(--color-border)", marginInline: -16 }} />;
}

/**
 * Preferences — theme and default home view.
 */
export function PreferencesPanel() {
  const { mode, setMode } = useThemeMode();
  const basePath = useAdminBasePath();
  const homeViewOptions =
    basePath === "/new-admin-migrate"
      ? HOME_VIEW_OPTIONS.filter((option) => option.id !== "inbox")
      : HOME_VIEW_OPTIONS;
  const [homeView, setHomeView] = useState<HomeViewId>(() => {
    const stored = typeof window === "undefined" ? "overview" : readHomeView();
    return stored === "inbox" && basePath === "/new-admin-migrate" ? "overview" : stored;
  });

  function handleHomeViewChange(next: HomeViewId) {
    setHomeView(next);
    writeHomeView(next);
  }

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
              description="Select which view to display when launching the admin"
              control={
                <select
                  style={selectStyle}
                  value={homeView}
                  onChange={(event) => {
                    if (isHomeViewId(event.target.value)) handleHomeViewChange(event.target.value);
                  }}
                >
                  {homeViewOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              }
            />
            <Divider />
            <SettingsRow
              label="Interface theme"
              description="Select your interface color scheme"
              control={
                <select
                  style={selectStyle}
                  value={mode}
                  onChange={(event) => setMode(event.target.value as ThemeMode)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              }
            />
          </VStack>
        </Card>
      </VStack>
    </VStack>
  );
}
