"use client";

import { useEffect, useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { StudentsRosterLive, type StudentsRosterLiveProps } from "./StudentsRosterLive";
import { getStudentsRoster } from "@/lib/students-live";
import { getClasses } from "@/lib/classes";
import type { StudentRow } from "@/data/mocks/students";

export function StudentsLive() {
  const [view, setView] = useState<StudentsRosterLiveProps["view"]>("all");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [activeClassCodes, setActiveClassCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [{ students: roster, error: rosterError }, { classes }] = await Promise.all([
        getStudentsRoster(),
        getClasses(),
      ]);

      if (cancelled) return;

      if (rosterError) {
        setError(rosterError);
      } else if (roster) {
        setStudents(roster);
      }

      const now = Date.now();
      const codes = new Set(
        (classes ?? [])
          .filter((cls) => !cls.class_close_date || new Date(cls.class_close_date).getTime() >= now)
          .map((cls) => cls.class_id),
      );
      setActiveClassCodes(codes);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<MigrateSidebar />}
        header={
          <CanvasHeader
            topbar={{ title: "Students" }}
            controls={
              <ViewTabs aria-label="Students views">
                <ViewTab label="All Students" selected={view === "all"} onClick={() => setView("all")} />
                <ViewTab
                  label="Active Students"
                  selected={view === "active"}
                  onClick={() => setView("active")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {loading ? (
          <div style={{ padding: 24, color: "var(--linear-color-ink-subtle)" }}>Loading students…</div>
        ) : error ? (
          <div style={{ padding: 24, color: "var(--linear-color-danger, #eb5757)" }}>{error}</div>
        ) : (
          <StudentsRosterLive data={students} activeClassCodes={activeClassCodes} view={view} />
        )}
      </FoundationLayout>
    </div>
  );
}
