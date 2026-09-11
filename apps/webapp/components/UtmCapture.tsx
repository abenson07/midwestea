"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/lib/utmAttribution";

/** Site-wide first-touch UTM capture — see lib/utmAttribution.ts. */
export function UtmCapture() {
  useEffect(() => {
    captureUtmParams();
  }, []);

  return null;
}
