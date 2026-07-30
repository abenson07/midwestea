"use client";

import { useState, type ReactNode } from "react";
import {
  Box,
  Briefcase,
  Circle,
  CircleDot,
  FolderPlus,
  GitPullRequest,
  HelpCircle,
  Home,
  Inbox,
  Layers,
  LayoutList,
  MoreHorizontal,
  PenSquare,
  Pencil,
  Plus,
  Scan,
  Search,
  Send,
  Settings,
  Users,
  UserSquare,
} from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/patterns/shared/dropdown";
import {
  MenuItem,
  NavBottom,
  SidebarGroup,
  SidebarHeader,
  SidebarHeaderActions,
  SidebarIconButton,
  SidebarScrollArea,
  SidebarSection,
  TryButton,
  WorkspaceMenu,
} from "./sidebar";
import "./sidebar/sidebar.css";

type DemoItem = {
  id: string;
  label: string;
  icon: ReactNode;
  count?: number;
};

const primaryItems: DemoItem[] = [
  {
    id: "inbox",
    label: "Inbox",
    icon: <Inbox size={16} strokeWidth={1.75} />,
    count: 27,
  },
  {
    id: "agent",
    label: "Agent",
    icon: <Send size={16} strokeWidth={1.75} />,
  },
  {
    id: "drafts",
    label: "Drafts",
    icon: <FolderPlus size={16} strokeWidth={1.75} />,
    count: 6,
  },
];

const workspaceItems: DemoItem[] = [
  {
    id: "initiatives",
    label: "Initiatives",
    icon: <CircleDot size={16} strokeWidth={1.75} />,
  },
  {
    id: "projects",
    label: "Projects",
    icon: <Box size={16} strokeWidth={1.75} />,
  },
];

const favoriteItems: DemoItem[] = [
  {
    id: "fav-invoicing",
    label: "Invoicing & Registration",
    icon: <Box size={16} strokeWidth={1.75} color="#5e6ad2" />,
  },
  {
    id: "fav-integrations",
    label: "External Integrations — Platinum ED & JB Learning",
    icon: <Box size={16} strokeWidth={1.75} color="#e879a9" />,
  },
  {
    id: "fav-student",
    label: "Student Accounts & Login",
    icon: <Box size={16} strokeWidth={1.75} />,
  },
  {
    id: "fav-health",
    label: "Health Tracking App V1",
    icon: <Box size={16} strokeWidth={1.75} color="#f0a58e" />,
  },
  {
    id: "fav-midwest",
    label: "Midwest EA",
    icon: <Circle size={16} strokeWidth={1.75} />,
  },
  {
    id: "fav-personal",
    label: "Personal Projects",
    icon: <CircleDot size={16} strokeWidth={1.75} color="#4db6ac" />,
  },
];

const teamChildItems: DemoItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home size={16} strokeWidth={1.75} />,
  },
  {
    id: "issues",
    label: "Issues",
    icon: <LayoutList size={16} strokeWidth={1.75} />,
  },
  {
    id: "team-projects",
    label: "Projects",
    icon: <Box size={16} strokeWidth={1.75} />,
  },
  {
    id: "views",
    label: "Views",
    icon: <Layers size={16} strokeWidth={1.75} />,
  },
];

export type LinearSidebarProps = {
  onSettingsClick?: () => void;
};

/**
 * Linear-style sidebar composed from named sidebar primitives.
 */
export function LinearSidebar({ onSettingsClick }: LinearSidebarProps = {}) {
  const [selectedId, setSelectedId] = useState("inbox");

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
        <WorkspaceMenu name="mwo">
          <DropdownItem
            label="Settings"
            icon={<Settings size={16} strokeWidth={1.75} />}
            onSelect={onSettingsClick}
          />
          <DropdownSeparator />
          <DropdownItem label="mwo" icon={<CircleDot size={16} strokeWidth={1.75} />} selected />
          <DropdownSeparator />
          <DropdownItem label="Create workspace" />
        </WorkspaceMenu>
        <SidebarHeaderActions>
          <SidebarIconButton
            label="Search"
            variant="ghost"
            icon={<Search size={16} strokeWidth={1.75} />}
          />
          <SidebarIconButton
            label="Create new issue"
            variant="primary"
            icon={<PenSquare size={16} strokeWidth={1.75} />}
          />
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
              selected={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
            />
          ))}
        </div>

        <SidebarSection title="Workspace">
          {workspaceItems.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
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
              label="Reviews"
              icon={<GitPullRequest size={16} strokeWidth={1.75} />}
              onSelect={() => setSelectedId("reviews")}
            />
            <DropdownItem
              label="My issues"
              icon={<Scan size={16} strokeWidth={1.75} />}
              onSelect={() => setSelectedId("my-issues")}
            />
            <DropdownItem
              label="Views"
              icon={<Layers size={16} strokeWidth={1.75} />}
              onSelect={() => setSelectedId("more-views")}
            />
            <DropdownItem
              label="Members"
              icon={<Users size={16} strokeWidth={1.75} />}
              onSelect={() => setSelectedId("members")}
            />
            <DropdownItem
              label="Teams"
              icon={<UserSquare size={16} strokeWidth={1.75} />}
              onSelect={() => setSelectedId("teams")}
            />
            <DropdownSeparator />
            <DropdownItem
              label="Customize sidebar"
              icon={<Pencil size={16} strokeWidth={1.75} />}
            />
          </Dropdown>
        </SidebarSection>

        <SidebarSection
          title="Favorites"
          action={
            <SidebarIconButton
              label="Create new folder for favorites"
              variant="ghost"
              icon={<Plus size={14} strokeWidth={2} />}
            />
          }
        >
          {favoriteItems.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
            />
          ))}
        </SidebarSection>

        <SidebarSection
          title="Your teams"
          action={
            <SidebarIconButton
              label="Create team"
              variant="ghost"
              icon={<Plus size={14} strokeWidth={2} />}
            />
          }
        >
          <SidebarGroup
            label="Benson Projects"
            icon={<Box size={16} strokeWidth={1.75} color="#27a644" />}
            selected={selectedId === "team-benson"}
            onSelect={() => setSelectedId("team-benson")}
            action={
              <SidebarIconButton
                label="Team menu"
                variant="ghost"
                icon={<MoreHorizontal size={14} strokeWidth={2} />}
              />
            }
          >
            {teamChildItems.map((item) => {
              const id = `benson-${item.id}`;
              return (
                <MenuItem
                  key={id}
                  label={item.label}
                  icon={item.icon}
                  depth={1}
                  selected={selectedId === id}
                  onClick={() => setSelectedId(id)}
                />
              );
            })}
          </SidebarGroup>
          <SidebarGroup
            label="Tasks"
            icon={<Briefcase size={16} strokeWidth={1.75} color="#27a644" />}
            selected={selectedId === "team-tasks"}
            onSelect={() => setSelectedId("team-tasks")}
            action={
              <SidebarIconButton
                label="Team menu"
                variant="ghost"
                icon={<MoreHorizontal size={14} strokeWidth={2} />}
              />
            }
          >
            {teamChildItems.map((item) => {
              const id = `tasks-${item.id}`;
              return (
                <MenuItem
                  key={id}
                  label={item.label}
                  icon={item.icon}
                  depth={1}
                  selected={selectedId === id}
                  onClick={() => setSelectedId(id)}
                />
              );
            })}
          </SidebarGroup>
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
