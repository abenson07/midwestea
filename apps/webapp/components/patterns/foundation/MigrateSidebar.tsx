"use client";

import { useEffect, useState, type ReactNode } from "react";
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
import { getClasses, type Class } from "@/lib/classes";
import "./sidebar/sidebar.css";

const CLASS_COLORS = ["#5e6ad2", "#27a644", "#f2994a", "#eb5757", "#f2c94c", "#8a8f98"];

function isClassClosed(cls: Class): boolean {
  if (!cls.class_close_date) return false;
  const closeDate = new Date(cls.class_close_date);
  return !Number.isNaN(closeDate.getTime()) && closeDate.getTime() < Date.now();
}

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
    href: "/admin-migrate/classes",
  },
  {
    id: "students",
    label: "Students",
    icon: <Users size={16} strokeWidth={1.75} />,
    href: "/admin-migrate/students",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: <CreditCard size={16} strokeWidth={1.75} />,
    href: "/admin-migrate/transactions",
  },
];

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

export type MigrateSidebarProps = {
  onSettingsClick?: () => void;
};

/**
 * Real-data admin nav, copied from LinearSidebar so admin-preview stays frozen.
 * Open Classes / Online Classes lists are fetched from real class data,
 * since (unlike the demo) they can't be hardcoded.
 */
export function MigrateSidebar({ onSettingsClick }: MigrateSidebarProps = {}) {
  const [selectedId, setSelectedId] = useState("inbox");
  const [openClasses, setOpenClasses] = useState<Class[]>([]);
  const [onlineClasses, setOnlineClasses] = useState<Class[]>([]);
  const { mode, toggle } = useThemeMode();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { classes } = await getClasses();
      if (cancelled || !classes) return;
      setOpenClasses(classes.filter((cls) => !cls.is_online && !isClassClosed(cls)));
      setOnlineClasses(classes.filter((cls) => cls.is_online));
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
              onSelect={() => router.push("/admin-migrate/programs")}
            />
            <DropdownItem
              label="Courses"
              icon={<BookOpen size={16} strokeWidth={1.75} />}
              onSelect={() => router.push("/admin-migrate/courses")}
            />
            <DropdownItem
              label="Staff"
              icon={<UserSquare size={16} strokeWidth={1.75} />}
              selected={pathname === "/admin-migrate/staff"}
              onSelect={() => router.push("/admin-migrate/staff")}
            />
            <DropdownItem
              label="Payouts"
              icon={<Banknote size={16} strokeWidth={1.75} />}
              selected={pathname === "/admin-migrate/payouts"}
              onSelect={() => router.push("/admin-migrate/payouts")}
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
          {openClasses.map((cls, index) => (
            <MenuItem
              key={cls.id}
              label={cls.class_id}
              icon={<Box size={16} strokeWidth={1.75} color={CLASS_COLORS[index % CLASS_COLORS.length]} />}
              selected={selectedId === cls.id}
              onClick={() => setSelectedId(cls.id)}
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
            {onlineClasses.map((cls) => (
              <DropdownItem
                key={cls.id}
                label={cls.class_id}
                onSelect={() => {
                  setSelectedId(`online-${cls.id}`);
                  router.push("/admin-migrate/online-class-detail");
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
