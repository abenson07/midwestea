"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { useAdminBasePath, useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { Text } from "@/components/patterns/primitives/Text";
import { CatalogSettingsPage } from "@/components/patterns/client-templates-migrate/catalog/CatalogSettingsPage";
import {
  catalogTemplateFor,
  type CatalogTemplate,
} from "@/components/patterns/client-templates-migrate/catalog/catalogMocks";
import { StaffDemo } from "@/components/patterns/client-templates-migrate/staff";
import { LocationsDemo } from "@/components/patterns/client-templates-migrate/locations";
import type { LocationRow } from "@/components/patterns/client-templates-migrate/locations/types";
import { PrerequisitesDemo } from "@/components/patterns/client-templates-migrate/prerequisites";
import type { PrerequisiteRow } from "@/components/patterns/client-templates-migrate/prerequisites/types";
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

function CatalogTemplateSettings({
  templateId,
  templates,
}: {
  templateId: string;
  templates?: CatalogTemplate[];
}) {
  const live = useIsNewAdminMigrate();
  const [template, setTemplate] = useState<CatalogTemplate | null>(
    () => templates?.find((row) => row.id === templateId) ?? (live ? null : catalogTemplateFor(templateId)),
  );
  if (!template) {
    return (
      <div style={{ padding: 24 }}>
        <Text color="secondary">No template matches this profile.</Text>
      </div>
    );
  }
  return (
    <CatalogSettingsPage
      key={templateId}
      template={template}
      onSave={setTemplate}
    />
  );
}

function SettingsBody({
  navId,
  templates,
  locations,
  prerequisites,
}: {
  navId: string;
  templates?: CatalogTemplate[];
  locations?: LocationRow[];
  prerequisites?: PrerequisiteRow[];
}) {
  if (navId === "profile") return <ProfilePanel />;
  if (navId === "preferences") return <PreferencesPanel />;
  if (navId === "trainers") return <StaffDemo view="trainers" />;
  if (navId === "admins") return <StaffDemo view="admin" />;
  if (navId === "prerequisites") return <PrerequisitesDemo rows={prerequisites} />;
  if (navId === "locations") return <LocationsDemo rows={locations} />;
  if (navId === "logs") return <LogsPage />;
  if (navId === "payouts") return <PayoutsPage />;
  if (navId === "download-invoices") return <DownloadInvoicesPage />;

  const programMatch = navId.match(/^programs\/(.+)$/);
  if (programMatch?.[1]) {
    return <CatalogTemplateSettings templateId={programMatch[1]} templates={templates} />;
  }
  const courseMatch = navId.match(/^courses\/(.+)$/);
  if (courseMatch?.[1]) {
    return <CatalogTemplateSettings templateId={courseMatch[1]} templates={templates} />;
  }

  return <PreferencesPanel />;
}

export type SettingsDemoProps = {
  templates?: CatalogTemplate[];
  locations?: LocationRow[];
  prerequisites?: PrerequisiteRow[];
};

export function SettingsDemo({ templates, locations, prerequisites }: SettingsDemoProps = {}) {
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
            templates={templates}
          />
        }
      >
        {isInset ? (
          <SettingsBody
            key={selectedNavId}
            navId={selectedNavId}
            templates={templates}
            locations={locations}
            prerequisites={prerequisites}
          />
        ) : isCatalog ? (
          <div style={{ height: "100%", minHeight: 0, overflow: "auto" }}>
            <SettingsBody
              key={selectedNavId}
              navId={selectedNavId}
              templates={templates}
              locations={locations}
              prerequisites={prerequisites}
            />
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
              <SettingsBody
                key={selectedNavId}
                navId={selectedNavId}
                templates={templates}
                locations={locations}
                prerequisites={prerequisites}
              />
            </div>
          </div>
        )}
      </FoundationLayout>
    </div>
  );
}
