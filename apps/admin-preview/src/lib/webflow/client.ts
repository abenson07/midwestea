const WEBFLOW_API_BASE = "https://api.webflow.com/v2";

export class WebflowRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown
  ) {
    super(message);
    this.name = "WebflowRequestError";
  }
}

export async function webflowJson<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${WEBFLOW_API_BASE}${path}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  const res = await fetch(url, {
    ...init,
    headers:
      init?.body != null
        ? { ...headers, "Content-Type": "application/json" }
        : headers,
  });
  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = { raw: text };
    }
  }
  if (!res.ok) {
    const msg =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message: unknown }).message === "string"
        ? (parsed as { message: string }).message
        : `${res.status} ${res.statusText}`;
    throw new WebflowRequestError(msg, res.status, parsed);
  }
  return (parsed ?? {}) as T;
}
