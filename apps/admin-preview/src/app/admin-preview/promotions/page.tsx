"use client";

import {
  MobileAdminShell,
  MobileDesktopFallback,
  MobilePromotionsPage,
  useIsMobileAdmin,
} from "@/components/patterns/client-templates-migrate/mobile";

export default function PromotionsRoute() {
  const isMobile = useIsMobileAdmin();

  if (!isMobile) {
    return (
      <MobileDesktopFallback
        title="Promotions"
        desktopHref="/admin-preview/comms"
        desktopLabel="Open Comms"
      />
    );
  }

  return (
    <MobileAdminShell active="promotions">
      <MobilePromotionsPage />
    </MobileAdminShell>
  );
}
