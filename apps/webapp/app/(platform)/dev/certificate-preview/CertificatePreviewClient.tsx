"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { useMemo, useState, type CSSProperties } from "react";
import { CompletionCertificateDocument } from "@/lib/certificates/completion-certificate";
import { renderCompletionCertificatePdf } from "@/lib/certificates/render";
import {
  formatExpiresLabel,
  getCertificateExpiresAt,
  type CompletionCertificateProps,
} from "@/lib/certificates/types";

type Preset = {
  id: string;
  label: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  durationYears: string;
  bemsNumber: string;
};

const PRESETS: Preset[] = [
  {
    id: "spencer",
    label: "Spencer Nash / EMT-B",
    studentName: "Spencer Nash",
    courseName: "EMT-B",
    completionDate: "2026-04-11",
    durationYears: "2",
    bemsNumber: "04722B-CA",
  },
  {
    id: "hannah",
    label: "Hannah Briggs / Paramedic",
    studentName: "Hannah Briggs",
    courseName: "Paramedic",
    completionDate: "2026-06-20",
    durationYears: "2",
    bemsNumber: "04722B-CA",
  },
  {
    id: "owen",
    label: "Owen Fraser / EMR",
    studentName: "Owen Fraser",
    courseName: "EMR",
    completionDate: "2025-12-04",
    durationYears: "1",
    bemsNumber: "04722B-CA",
  },
];

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  fontSize: 13,
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
  color: "#333",
};

function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "student";
}

export default function CertificatePreviewClient() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [studentName, setStudentName] = useState(PRESETS[0].studentName);
  const [courseName, setCourseName] = useState(PRESETS[0].courseName);
  const [completionDate, setCompletionDate] = useState(PRESETS[0].completionDate);
  const [durationYears, setDurationYears] = useState(PRESETS[0].durationYears);
  const [bemsNumber, setBemsNumber] = useState(PRESETS[0].bemsNumber);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const parsedDuration = durationYears.trim() === "" ? null : Number(durationYears);
  const durationValue =
    parsedDuration == null || Number.isNaN(parsedDuration) ? null : parsedDuration;

  let expiresAt: string | null = null;
  let expiryError = "";
  try {
    expiresAt = getCertificateExpiresAt(completionDate, durationValue);
  } catch (err) {
    expiryError = err instanceof Error ? err.message : "Invalid date";
  }

  const assetBaseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const props: CompletionCertificateProps = useMemo(
    () => ({
      studentName,
      courseName,
      completionDate,
      durationYears: durationValue,
      bemsNumber,
      assetBaseUrl,
    }),
    [studentName, courseName, completionDate, durationValue, bemsNumber, assetBaseUrl],
  );

  function applyPreset(id: string) {
    const preset = PRESETS.find((row) => row.id === id);
    if (!preset) return;
    setPresetId(id);
    setStudentName(preset.studentName);
    setCourseName(preset.courseName);
    setCompletionDate(preset.completionDate);
    setDurationYears(preset.durationYears);
    setBemsNumber(preset.bemsNumber);
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError("");
    try {
      const blob = await renderCompletionCertificatePdf(props);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${slug(studentName)}-${slug(courseName)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          padding: "12px 20px",
          borderBottom: "1px solid #e0e0e0",
          background: "#fff",
        }}
      >
        <strong>Certificate preview</strong>
        <span style={{ color: "#888", fontSize: 13 }}>
          On-demand PDF — duration is not printed on the certificate
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div
          style={{
            width: 340,
            flexShrink: 0,
            overflowY: "auto",
            padding: 16,
            borderRight: "1px solid #e0e0e0",
            background: "#fafafa",
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Preset</label>
            <select
              value={presetId}
              onChange={(e) => applyPreset(e.target.value)}
              style={fieldStyle}
            >
              {PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Student name</label>
            <input
              value={studentName}
              onChange={(e) => {
                setPresetId("");
                setStudentName(e.target.value);
              }}
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Class / course</label>
            <input
              value={courseName}
              onChange={(e) => {
                setPresetId("");
                setCourseName(e.target.value);
              }}
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Completion date</label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => {
                setPresetId("");
                setCompletionDate(e.target.value);
              }}
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Duration (years)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={durationYears}
              onChange={(e) => {
                setPresetId("");
                setDurationYears(e.target.value);
              }}
              style={fieldStyle}
            />
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#555", lineHeight: 1.4 }}>
              {expiryError
                ? expiryError
                : expiresAt
                  ? `Expiry (not on PDF): ${formatExpiresLabel(expiresAt)}`
                  : "No duration — no expiry date"}
            </p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>BEMS #</label>
            <input
              value={bemsNumber}
              onChange={(e) => {
                setPresetId("");
                setBemsNumber(e.target.value);
              }}
              style={fieldStyle}
            />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600,
              background: "#1b2a4a",
              color: "#fff",
              border: 0,
              borderRadius: 4,
              cursor: downloading ? "wait" : "pointer",
            }}
          >
            {downloading ? "Generating…" : "Download PDF"}
          </button>
          {downloadError ? (
            <p style={{ marginTop: 8, color: "#c0392b", fontSize: 12 }}>{downloadError}</p>
          ) : null}
        </div>

        <div style={{ flex: 1, background: "#d8d8d8", minWidth: 0 }}>
          <PDFViewer
            key={`${studentName}|${courseName}|${completionDate}|${bemsNumber}`}
            width="100%"
            height="100%"
            showToolbar={false}
          >
            <CompletionCertificateDocument {...props} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
