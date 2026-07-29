"use client";

import { useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { ProgramSettingsSideNav } from "./ProgramSettingsSideNav";
import { ProgramBasicInfoPanel } from "./ProgramBasicInfoPanel";
import { ProgramGeneralPanel } from "./ProgramGeneralPanel";

export function ProgramSettingsDemo() {
  const [selectedNavId, setSelectedNavId] = useState("basic-info");

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={
          <ProgramSettingsSideNav
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
            {selectedNavId === "basic-info" ? (
              <ProgramBasicInfoPanel />
            ) : (
              <ProgramGeneralPanel />
            )}
          </div>
        </div>
      </FoundationLayout>
    </div>
  );
}
