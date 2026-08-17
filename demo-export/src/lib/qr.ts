import QRCode from "qrcode";

const DEFAULT_SIZE = 256;
const PREVIEW_SIZE = 64;

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("URL is required.");
  }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error("Enter a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL must use http or https.");
  }
  return parsed.href;
}

function renderToCanvas(url: string, size: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  return QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
  }).then(() => canvas);
}

export async function generateQrPngBlob(
  url: string,
  size: number = DEFAULT_SIZE,
): Promise<Blob> {
  const canvas = await renderToCanvas(url, size);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });
  if (!blob) {
    throw new Error("Failed to generate QR image.");
  }
  return blob;
}

export async function generateQrPngDataUrl(
  url: string,
  size: number = PREVIEW_SIZE,
): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

export async function copyQrPngToClipboard(url: string): Promise<void> {
  const blob = await generateQrPngBlob(url);
  if (!navigator.clipboard?.write) {
    throw new Error("Clipboard is not available in this browser.");
  }
  await navigator.clipboard.write([
    new ClipboardItem({
      "image/png": blob,
    }),
  ]);
}

export async function downloadQrPng(url: string, filename: string): Promise<void> {
  const dataUrl = await QRCode.toDataURL(url, {
    width: DEFAULT_SIZE,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.click();
}

export function qrDownloadFilename(row: { name: string | null; id: string }): string {
  const base =
    row.name
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `qr-${row.id.slice(0, 8)}`;
  return `${base}.png`;
}
