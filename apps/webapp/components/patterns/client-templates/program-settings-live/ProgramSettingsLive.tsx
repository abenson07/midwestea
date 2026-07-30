"use client";

import { useEffect, useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { ProgramSettingsSideNavLive } from "./ProgramSettingsSideNavLive";
import { RecordBasicInfoPanelLive } from "@/components/patterns/client-templates/record-settings-live";
import { ProgramGeneralPanel } from "@/components/patterns/client-templates/program-settings";
import { getPrograms, type Course } from "@/lib/classes";

export function ProgramSettingsLive() {
  const [selectedNavId, setSelectedNavId] = useState("basic-info");
  const [programs, setPrograms] = useState<Course[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingRecords(true);
      const { programs: fetched } = await getPrograms();
      if (!cancelled && fetched) setPrograms(fetched);
      setLoadingRecords(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<ProgramSettingsSideNavLive selectedNavId={selectedNavId} onNavSelect={setSelectedNavId} />}
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
              <RecordBasicInfoPanelLive
                recordLabel="Program"
                referenceType="program"
                records={programs}
                loadingRecords={loadingRecords}
              />
            ) : (
              <ProgramGeneralPanel />
            )}
          </div>
        </div>
      </FoundationLayout>
    </div>
  );
}
