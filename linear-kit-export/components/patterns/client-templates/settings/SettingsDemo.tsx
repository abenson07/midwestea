"use client";

import { useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { settingsNavSections } from "@/data/mocks/settings-nav";
import { SettingsSideNav } from "./SettingsSideNav";
import { PreferencesPanel } from "./PreferencesPanel";
import { SettingsPlaceholderPanel } from "./SettingsPlaceholderPanel";

function findLabel(id: string): string {
  for (const section of settingsNavSections) {
    const item = section.items.find((entry) => entry.id === id);
    if (item) return item.label;
  }
  return id;
}

export function SettingsDemo() {
  const [selectedNavId, setSelectedNavId] = useState("preferences");

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={
          <SettingsSideNav
            selectedNavId={selectedNavId}
            onNavSelect={setSelectedNavId}
          />
        }
      >
        <div
          style={{
            height: "100%",
            minHeight: 0,
            overflow: "auto",
            boxSizing: "border-box",
            padding: "48px 24px 64px",
          }}
        >
          <div style={{ maxWidth: 640, marginInline: "auto" }}>
            {selectedNavId === "preferences" ? (
              <PreferencesPanel />
            ) : (
              <SettingsPlaceholderPanel label={findLabel(selectedNavId)} />
            )}
          </div>
        </div>
      </FoundationLayout>
    </div>
  );
}
