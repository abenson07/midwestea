"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import {
  getCertificatesByStudentId,
  getCertificateDisplayStatus,
  type CertificateWithClass,
} from "@/lib/certificates";

const STATUS_LABEL: Record<"pending" | "active" | "expired", string> = {
  pending: "Not yet issued",
  active: "Active",
  expired: "Expired",
};

const STATUS_CLASSES: Record<"pending" | "active" | "expired", string> = {
  pending: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
};

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
}

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateWithClass[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { session } = await getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { certificates: fetched, error: fetchError } = await getCertificatesByStudentId(
        session.user.id
      );
      if (fetchError) {
        setError(fetchError);
      } else {
        setCertificates(fetched);
      }
      setLoading(false);
    };
    load();
  }, []);

  async function handleDownload(certificateId: string) {
    const { session } = await getSession();
    if (!session) return;
    const response = await fetch(`/api/students/me/certificates/${certificateId}/download`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificate-${certificateId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Certificates</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : !certificates || certificates.length === 0 ? (
        <p className="text-gray-500">You don't have any certificates yet.</p>
      ) : (
        <div className="space-y-4 max-w-lg">
          {certificates.map((certificate) => {
            const displayStatus = getCertificateDisplayStatus(certificate);
            return (
              <div
                key={certificate.id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-medium text-gray-900">
                      {certificate.class_name || certificate.course_code || "Certificate"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Issued: {formatDate(certificate.issued_at)}
                    </p>
                    {certificate.expires_at && (
                      <p className="text-sm text-gray-500">
                        Expires: {formatDate(certificate.expires_at)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${STATUS_CLASSES[displayStatus]}`}
                    >
                      {STATUS_LABEL[displayStatus]}
                    </span>
                    {(displayStatus === "active" || displayStatus === "expired") &&
                      certificate.file_url && (
                        <button
                          onClick={() => handleDownload(certificate.id)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 whitespace-nowrap"
                        >
                          Download PDF
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
