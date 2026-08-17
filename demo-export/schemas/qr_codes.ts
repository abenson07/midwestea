/**
 * QR codes managed under Communications.
 */

export interface QrCodes {
  id: string;
  name: string | null;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface QrCodesInsert {
  name?: string | null;
  url: string;
}

export interface QrCodesUpdate {
  name?: string | null;
  url?: string;
}
