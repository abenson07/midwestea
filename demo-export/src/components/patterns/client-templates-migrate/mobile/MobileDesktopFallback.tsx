"use client";

import Link from "next/link";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared/useAdminBasePath";
import { mobileEmptyStyle, mobilePageStyle, mobileTitleStyle } from "./mobileStyles";

/** Shown when a mobile-primary route is opened on desktop. */
export function MobileDesktopFallback({
  title,
  desktopHref,
  desktopLabel,
}: {
  title: string;
  desktopHref: string;
  desktopLabel: string;
}) {
  const base = useAdminBasePath();
  return (
    <div
      style={{
        ...mobilePageStyle,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
      }}
    >
      <h1 style={{ ...mobileTitleStyle, marginBottom: 8 }}>{title}</h1>
      <p style={{ ...mobileEmptyStyle, padding: 0, maxWidth: 360 }}>
        This screen is built for phone-width admin. On desktop, use the full sidebar experience.
      </p>
      <Link
        href={`${base}${desktopHref}`}
        style={{
          marginTop: 16,
          color: "var(--linear-color-accent)",
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        {desktopLabel} →
      </Link>
    </div>
  );
}
