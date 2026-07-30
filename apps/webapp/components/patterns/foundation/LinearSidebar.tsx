"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Banknote,
  Box,
  BookOpen,
  CreditCard,
  GraduationCap,
  HelpCircle,
  Inbox,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sun,
  Users,
  UserSquare,
} from "lucide-react";
import {
  Dropdown,
  DropdownItem,
} from "@/components/patterns/shared/dropdown";
import {
  MenuItem,
  NavBottom,
  SidebarHeader,
  SidebarHeaderActions,
  SidebarIconButton,
  SidebarScrollArea,
  SidebarSection,
  TryButton,
  WorkspaceMenu,
} from "./sidebar";
import { useThemeMode } from "./ThemeContext";
import "./sidebar/sidebar.css";

type DemoItem = {
  id: string;
  label: string;
  icon: ReactNode;
  count?: number;
  /** When set, clicking navigates here instead of toggling local selection. */
  href?: string;
};

const primaryItems: DemoItem[] = [
  {
    id: "inbox",
    label: "Inbox",
    icon: <Inbox size={16} strokeWidth={1.75} />,
    count: 27,
  },
  {
    id: "classes",
    label: "Classes",
    icon: <GraduationCap size={16} strokeWidth={1.75} />,
    href: "/admin-preview/classes",
  },
  {
    id: "students",
    label: "Students",
    icon: <Users size={16} strokeWidth={1.75} />,
    href: "/admin-preview/students",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: <CreditCard size={16} strokeWidth={1.75} />,
    href: "/admin-preview/transactions",
  },
];

const openClassItems: DemoItem[] = [
  {
    id: "class-para-002",
    label: "PARA-002",
    icon: <Box size={16} strokeWidth={1.75} color="#5e6ad2" />,
  },
  {
    id: "class-emt-003",
    label: "EMT-003",
    icon: <Box size={16} strokeWidth={1.75} color="#27a644" />,
  },
  {
    id: "class-atcc-001",
    label: "ATCC-001",
    icon: <Box size={16} strokeWidth={1.75} color="#f2994a" />,
  },
];

const onlineClasses = ["CABS", "ACLS", "BLS", "EPI", "OXY", "PALS", "PEDS", "PATH", "CPR"];

function KyleBrowerAvatar() {
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        background: "#5e6ad2",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#ffffff",
        fontSize: 9,
        fontWeight: 600,
      }}
    >
      KB
    </span>
  );
}

export type LinearSidebarProps = {
  onSettingsClick?: () => void;
};

/**
 * Linear-style sidebar composed from named sidebar primitives.
 */
export function LinearSidebar({ onSettingsClick }: LinearSidebarProps = {}) {
  const [selectedId, setSelectedId] = useState("inbox");
  const { mode, toggle } = useThemeMode();
  const pathname = usePathname();
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
      }}
    >
      <SidebarHeader>
        <WorkspaceMenu name="Kyle Brower" icon={<KyleBrowerAvatar />}>
          <DropdownItem
            label="Settings"
            icon={<Settings size={16} strokeWidth={1.75} />}
            onSelect={onSettingsClick}
          />
          <DropdownItem
            label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            icon={
              mode === "dark" ? (
                <Sun size={16} strokeWidth={1.75} />
              ) : (
                <Moon size={16} strokeWidth={1.75} />
              )
            }
            onSelect={toggle}
          />
        </WorkspaceMenu>
        <SidebarHeaderActions>
          <SidebarIconButton
            label="Search"
            variant="ghost"
            icon={<Search size={16} strokeWidth={1.75} />}
          />
          <Dropdown
            label="Create"
            placement="below"
            alignment="end"
            trigger={
              <SidebarIconButton
                label="Create new issue"
                variant="primary"
                icon={<Plus size={16} strokeWidth={1.75} />}
              />
            }
          >
            <DropdownItem
              label="New Class"
              icon={<GraduationCap size={16} strokeWidth={1.75} />}
            />
            <DropdownItem
              label="New Student"
              icon={<Users size={16} strokeWidth={1.75} />}
            />
            <DropdownItem
              label="New Invoice"
              icon={<CreditCard size={16} strokeWidth={1.75} />}
            />
          </Dropdown>
        </SidebarHeaderActions>
      </SidebarHeader>

      <SidebarScrollArea>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {primaryItems.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              count={item.count}
              selected={item.href ? pathname === item.href : selectedId === item.id}
              onClick={() => {
                if (item.href) router.push(item.href);
                else setSelectedId(item.id);
              }}
            />
          ))}
          <Dropdown
            label="More"
            trigger={
              <MenuItem
                label="More"
                icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
                selected={selectedId === "more"}
                onClick={() => setSelectedId("more")}
              />
            }
          >
            <DropdownItem
              label="Programs"
              icon={<GraduationCap size={16} strokeWidth={1.75} />}
              onSelect={() => router.push("/admin-preview/programs")}
            />
            <DropdownItem
              label="Courses"
              icon={<BookOpen size={16} strokeWidth={1.75} />}
              onSelect={() => router.push("/admin-preview/courses")}
            />
            <DropdownItem
              label="Staff"
              icon={<UserSquare size={16} strokeWidth={1.75} />}
              selected={pathname === "/admin-preview/staff"}
              onSelect={() => router.push("/admin-preview/staff")}
            />
            <DropdownItem
              label="Payouts"
              icon={<Banknote size={16} strokeWidth={1.75} />}
              selected={pathname === "/admin-preview/payouts"}
              onSelect={() => router.push("/admin-preview/payouts")}
            />
          </Dropdown>
        </div>

        <SidebarSection
          title="Open Classes"
          action={
            <SidebarIconButton
              label="Add class"
              variant="ghost"
              icon={<Plus size={14} strokeWidth={2} />}
            />
          }
        >
          {openClassItems.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
            />
          ))}
          <Dropdown
            label="Online Classes"
            trigger={
              <MenuItem
                label="Online Classes"
                icon={<Box size={16} strokeWidth={1.75} />}
                selected={selectedId === "online-classes"}
                onClick={() => setSelectedId("online-classes")}
              />
            }
          >
            {onlineClasses.map((code) => (
              <DropdownItem
                key={code}
                label={code}
                onSelect={() => {
                  setSelectedId(`online-${code}`);
                  router.push("/admin-preview/online-class-detail");
                }}
              />
            ))}
          </Dropdown>
        </SidebarSection>
      </SidebarScrollArea>

      <NavBottom
        start={<TryButton />}
        end={
          <SidebarIconButton
            label="Help"
            variant="ghost"
            icon={<HelpCircle size={16} strokeWidth={1.75} />}
          />
        }
      />
    </div>
  );
}
