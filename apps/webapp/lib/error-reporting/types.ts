export type ErrorKind = "uncaught" | "unhandledrejection" | "http";

export interface BrowserInfo {
  userAgent?: string;
  language?: string;
  platform?: string;
  timezone?: string;
  viewport?: string;
  screenResolution?: string;
  referrer?: string;
  devicePixelRatio?: number;
  online?: boolean;
}

export interface ClientErrorPayload {
  pageUrl: string;
  message: string;
  kind: ErrorKind;
  requestUrl?: string;
  statusCode?: number;
  method?: string;
  stack?: string;
  responseBody?: string;
  timestamp: string;
  browserInfo?: BrowserInfo;
}

export interface ScrubbedErrorReport extends ClientErrorPayload {
  fingerprint: string;
  environment: string;
}
