"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/error-reporting/report-client-error";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      pageUrl: typeof window !== "undefined" ? window.location.href : "unknown",
      kind: "uncaught",
      message: error.message || "Unhandled render error",
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p>We&apos;ve been notified and are looking into it.</p>
        </div>
      </body>
    </html>
  );
}
