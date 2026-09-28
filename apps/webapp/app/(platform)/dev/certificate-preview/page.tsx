"use client";

import dynamic from "next/dynamic";

const CertificatePreviewClient = dynamic(() => import("./CertificatePreviewClient"), {
  ssr: false,
  loading: () => (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24, color: "#666" }}>
      Loading certificate preview…
    </div>
  ),
});

export default function CertificatePreviewPage() {
  return <CertificatePreviewClient />;
}
