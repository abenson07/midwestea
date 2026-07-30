"use client";

import { useEffect, useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CourseSettingsSideNavLive } from "./CourseSettingsSideNavLive";
import { RecordBasicInfoPanelLive } from "@/components/patterns/client-templates/record-settings-live";
import { CourseGeneralPanel } from "@/components/patterns/client-templates/course-settings";
import { getCourses, type Course } from "@/lib/classes";

export function CourseSettingsLive() {
  const [selectedNavId, setSelectedNavId] = useState("basic-info");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingRecords(true);
      const { courses: fetched } = await getCourses();
      if (!cancelled && fetched) setCourses(fetched);
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
        navigation={<CourseSettingsSideNavLive selectedNavId={selectedNavId} onNavSelect={setSelectedNavId} />}
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
                recordLabel="Course"
                referenceType="course"
                records={courses}
                loadingRecords={loadingRecords}
              />
            ) : (
              <CourseGeneralPanel />
            )}
          </div>
        </div>
      </FoundationLayout>
    </div>
  );
}
