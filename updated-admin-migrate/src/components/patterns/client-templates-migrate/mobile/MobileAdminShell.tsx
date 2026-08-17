"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Database,
  FileText,
  Megaphone,
  Search,
} from "lucide-react";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared/useAdminBasePath";
import { MobileSearchOverlay } from "./MobileSearchOverlay";

export type MobileAdminTab = "database" | "events" | "invoices" | "promotions";

export type MobileAdminShellProps = {
  active: MobileAdminTab;
  children: ReactNode;
  /** Hide bottom nav (e.g. nested event detail with its own back) */
  hideNav?: boolean;
};

const TABS: {
  id: MobileAdminTab;
  label: string;
  href: string;
  icon: typeof Database;
}[] = [
  { id: "database", label: "Database", href: "/database", icon: Database },
  { id: "events", label: "Events", href: "/events", icon: CalendarDays },
  { id: "invoices", label: "Invoices", href: "/invoices", icon: FileText },
  { id: "promotions", label: "Promotions", href: "/promotions", icon: Megaphone },
];

export function MobileAdminShell({ active, children, hideNav = false }: MobileAdminShellProps) {
  const base = useAdminBasePath();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "var(--linear-color-background)",
        color: "var(--linear-color-ink)",
      }}
    >
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
        {children}
      </div>

      {!hideNav ? (
        <nav
          aria-label="Mobile admin"
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "stretch",
            gap: 4,
            paddingTop: 6,
            paddingInline: 8,
            paddingBottom: "max(6px, env(safe-area-inset-bottom))",
            borderTop: "var(--linear-border-width) solid var(--linear-color-hairline)",
            background: "var(--linear-color-side-panel, var(--linear-color-canvas))",
          }}
        >
          <div style={{ display: "flex", flex: 1, gap: 2 }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === active;
              return (
                <Link
                  key={tab.id}
                  href={`${base}${tab.href}`}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    minHeight: 52,
                    paddingInline: 2,
                    textDecoration: "none",
                    color: isActive
                      ? "var(--linear-color-accent)"
                      : "var(--linear-color-ink-subtle)",
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              minWidth: 56,
              minHeight: 52,
              marginLeft: 4,
              border: "none",
              borderRadius: 10,
              background: "transparent",
              color: "var(--linear-color-ink-subtle)",
              fontSize: 10,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            <Search size={20} strokeWidth={1.75} />
            <span>Search</span>
          </button>
        </nav>
      ) : null}

      <MobileSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
