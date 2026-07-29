"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Settings } from "lucide-react";
import {
  MenuItem,
  SidebarHeader,
  SidebarScrollArea,
  SidebarSection,
} from "@/components/patterns/foundation/sidebar";
import "@/components/patterns/foundation/sidebar/sidebar.css";

export type ProgramSettingsSideNavProps = {
  selectedNavId: string;
  onNavSelect: (id: string) => void;
};

/** Settings sidebar for the generic Program settings page — two groups: Program, General. */
export function ProgramSettingsSideNav({
  selectedNavId,
  onNavSelect,
}: ProgramSettingsSideNavProps) {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: "8px 8px 10px",
        boxSizing: "border-box",
        gap: 8,
      }}
    >
      <SidebarHeader>
        <MenuItem
          label="Back to app"
          icon={<ArrowLeft size={16} strokeWidth={1.75} />}
          onClick={() => router.push("/admin-preview/programs")}
        />
      </SidebarHeader>

      <SidebarScrollArea>
        <SidebarSection title="Program">
          <MenuItem
            label="Basic info"
            icon={<GraduationCap size={16} strokeWidth={1.75} />}
            selected={selectedNavId === "basic-info"}
            onClick={() => onNavSelect("basic-info")}
          />
        </SidebarSection>
        <SidebarSection title="General">
          <MenuItem
            label="General"
            icon={<Settings size={16} strokeWidth={1.75} />}
            selected={selectedNavId === "general"}
            onClick={() => onNavSelect("general")}
          />
        </SidebarSection>
      </SidebarScrollArea>
    </div>
  );
}
