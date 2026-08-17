"use client";

import { Suspense } from "react";
import {
  MobileAdminShell,
  MobileDatabasePage,
  MobileDesktopFallback,
  useIsMobileAdmin,
} from "@/components/patterns/client-templates-migrate/mobile";

function DatabaseRouteInner() {
  const isMobile = useIsMobileAdmin();

  if (!isMobile) {
    return (
      <MobileDesktopFallback
        title="Database"
        desktopHref="/admin-preview/people"
        desktopLabel="Open People"
      />
    );
  }

  return (
    <MobileAdminShell active="database">
      <Suspense fallback={null}>
        <MobileDatabasePage />
      </Suspense>
    </MobileAdminShell>
  );
}

export default function DatabaseRoute() {
  return (
    <Suspense fallback={null}>
      <DatabaseRouteInner />
    </Suspense>
  );
}
