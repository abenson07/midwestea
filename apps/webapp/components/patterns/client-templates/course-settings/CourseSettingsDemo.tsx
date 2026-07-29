"use client";

import { useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CourseSettingsSideNav } from "./CourseSettingsSideNav";
import { CourseBasicInfoPanel } from "./CourseBasicInfoPanel";
import { CourseGeneralPanel } from "./CourseGeneralPanel";

export function CourseSettingsDemo() {
  const [selectedNavId, setSelectedNavId] = useState("basic-info");

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={
          <CourseSettingsSideNav
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
              <CourseBasicInfoPanel />
            ) : (
              <CourseGeneralPanel />
            )}
          </div>
        </div>
      </FoundationLayout>
    </div>
  );
}
