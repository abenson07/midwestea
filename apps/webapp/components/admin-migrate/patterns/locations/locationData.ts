import type { LocationRow } from "./types";

export const INITIAL_LOCATION_ROWS: LocationRow[] = [
  {
    id: "loc-eudora",
    name: "Eudora, KS",
    street: "",
    city: "",
    state: "",
    zip: "",
    mapsUrl: "",
  },
  {
    id: "loc-lawrence",
    name: "Lawrence",
    street: "300 w 31st St",
    city: "Lawrence",
    state: "KS",
    zip: "66046",
    mapsUrl:
      "https://www.google.com/maps/place/Consolidated+Fire+District+1,+Station+111/@38.929817,-95.2416805,17z/data=!3m1!4b1!4m6!3m5!1s0x87bf68972fbcf8d5:0x18a0ce22bebb5787!8m2!3d38.929817!4d-95.2391056!16s%2Fg%2F1tr18282",
  },
  {
    id: "loc-pleasant-valley",
    name: "Pleasant Valley, MO",
    street: "8108 Pleasant Valley Rd",
    city: "Pleasant Valley",
    state: "MO",
    zip: "64068",
    mapsUrl:
      "https://www.google.com/maps/place/Pleasant+Valley+Fire+Department/@39.217056,-94.4847821,17z/data=!3m1!4b1!4m6!3m5!1s0x87c0ff4b274bf501:0xe209d302b9b08cdb!8m2!3d39.217056!4d-94.4822072!16s%2Fg%2F1w2yzzl7",
  },
  {
    id: "loc-raytown",
    name: "Raytown, MO",
    street: "10020 E 66 Terrace",
    city: "Raytown",
    state: "MO",
    zip: "64133",
    mapsUrl:
      "https://www.google.com/maps/place/10020+E+66+Terrace,+Raytown,+MO+64133/@39.0037199,-94.4649156,571m/data=!3m1!1e3!4m9!1m2!2m1!1sRaytown+Fire+Protection+District+Station+53!3m5!1s0x87c0e3ebb7b32677:0x7d55411cb2c915b1!8m2!3d39.0030098!4d-94.4624367!16s%2Fg%2F11c193mfhn",
  },
  {
    id: "loc-topeka",
    name: "Topeka, KS",
    street: "",
    city: "",
    state: "",
    zip: "",
    mapsUrl: "",
  },
];

export function locationFieldDisplay(value: string): string {
  return value.trim() || "—";
}

export function hasMapsUrl(value: string | null | undefined): boolean {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed === "—") return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeMapsUrl(value: string): string {
  const trimmed = value.trim();
  return hasMapsUrl(trimmed) ? trimmed : "";
}

export function locationNameOptions(): string[] {
  return INITIAL_LOCATION_ROWS.map((row) => row.name);
}
