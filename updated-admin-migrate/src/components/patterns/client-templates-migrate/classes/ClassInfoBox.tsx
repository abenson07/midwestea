"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, CalendarClock } from "lucide-react";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import type { ClassDetail, ClassTemplateRef } from "./classMocks";

export type ClassInfoBoxProps = {
  classDetail: ClassDetail;
};

/** Icon + name row linking back to the program/course template a class was created from. */
function ClassTemplateLink({ template, onClick }: { template: ClassTemplateRef; onClick: () => void }) {
  const TemplateIcon = template.kind === "Program" ? GraduationCap : BookOpen;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: "unset",
        alignSelf: "flex-start",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--linear-color-ink-subtle)",
        fontSize: 13,
        lineHeight: "20px",
      }}
    >
      <TemplateIcon size={14} strokeWidth={1.75} />
      {template.name}
    </button>
  );
}

/** Class overview header — title, summary, and schedule, no card chrome. */
export function ClassInfoBox({ classDetail }: ClassInfoBoxProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();

  return (
    <header
      data-slot="class-info-box"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: "28px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--linear-color-ink)",
          }}
        >
          {classDetail.classCode}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {classDetail.template ? (
            <ClassTemplateLink
              template={classDetail.template}
              onClick={() => router.push(`${basePath}${classDetail.template!.href}`)}
            />
          ) : null}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--linear-color-ink-subtle)",
              fontSize: 13,
              lineHeight: "20px",
            }}
          >
            <CalendarClock size={14} strokeWidth={1.75} />
            32 days left to register
          </span>
        </div>
      </div>
    </header>
  );
}
