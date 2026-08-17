"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { CatalogSettingsPage } from "@/components/patterns/client-templates-migrate/catalog/CatalogSettingsPage";
import {
  catalogTemplateFor,
  type CatalogTemplate,
} from "@/components/patterns/client-templates-migrate/catalog/catalogMocks";
import { StaffDemo } from "@/components/patterns/client-templates-migrate/staff";
import { LocationsDemo } from "@/components/patterns/client-templates-migrate/locations";
import { PrerequisitesDemo } from "@/components/patterns/client-templates-migrate/prerequisites";
import { SettingsSideNav } from "./SettingsSideNav";
import { PreferencesPanel } from "./PreferencesPanel";
import { ProfilePanel } from "./ProfilePanel";
import { LogsPage } from "./LogsPage";
import { PayoutsPage } from "./PayoutsPage";
import { DownloadInvoicesPage } from "./DownloadInvoicesPage";

const INSET_IDS = new Set([
  "trainers",
  "admins",
  "prerequisites",
  "locations",
  "logs",
  "payouts",
  "download-invoices",
]);

function navIdFromPath(pathname: string, root: string): string {
  if (pathname === root || pathname === `${root}/`) return "preferences";
  if (!pathname.startsWith(`${root}/`)) return "preferences";
  const rest = pathname.slice(root.length + 1);
  if (!rest || rest === "preferences") return "preferences";
  return rest;
}

function hrefForNav(root: string, id: string): string {
  return id === "preferences" ? root : `${root}/${id}`;
}

function CatalogTemplateSettings({ templateId }: { templateId: string }) {
  const [template, setTemplate] = useState<CatalogTemplate>(() => catalogTemplateFor(templateId));
  return (
    <CatalogSettingsPage
      key={templateId}
      template={template}
      onSave={setTemplate}
    />
  );
}

function SettingsBody({ navId }: { navId: string }) {
  if (navId === "profile") return <ProfilePanel />;
  if (navId === "preferences") return <PreferencesPanel />;
  if (navId === "trainers") return <StaffDemo view="trainers" />;
  if (navId === "admins") return <StaffDemo view="admin" />;
  if (navId === "prerequisites") return <PrerequisitesDemo />;
  if (navId === "locations") return <LocationsDemo />;
  if (navId === "logs") return <LogsPage />;
  if (navId === "payouts") return <PayoutsPage />;
  if (navId === "download-invoices") return <DownloadInvoicesPage />;

  const programMatch = navId.match(/^programs\/(.+)$/);
  if (programMatch?.[1]) return <CatalogTemplateSettings templateId={programMatch[1]} />;
  const courseMatch = navId.match(/^courses\/(.+)$/);
  if (courseMatch?.[1]) return <CatalogTemplateSettings templateId={courseMatch[1]} />;

  return <PreferencesPanel />;
}

export function SettingsDemo() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = useAdminBasePath();
  const root = `${basePath}/settings`;
  const selectedNavId = navIdFromPath(pathname ?? "", root);
  const isInset = INSET_IDS.has(selectedNavId);
  const isCatalog = selectedNavId.startsWith("programs/") || selectedNavId.startsWith("courses/");

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={
          <SettingsSideNav
            selectedNavId={selectedNavId}
            onNavSelect={(id) => router.push(hrefForNav(root, id))}
            onBack={() => router.push(`${basePath}/overview`)}
          />
        }
      >
        {isInset ? (
          <SettingsBody key={selectedNavId} navId={selectedNavId} />
        ) : isCatalog ? (
          <div style={{ height: "100%", minHeight: 0, overflow: "auto" }}>
            <SettingsBody key={selectedNavId} navId={selectedNavId} />
          </div>
        ) : (
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
              <SettingsBody key={selectedNavId} navId={selectedNavId} />
            </div>
          </div>
        )}
      </FoundationLayout>
    </div>
  );
}
