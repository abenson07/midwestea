export type ErrorKind = "uncaught" | "unhandledrejection" | "http";

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
}

export interface ScrubbedErrorReport extends ClientErrorPayload {
  fingerprint: string;
  environment: string;
}
