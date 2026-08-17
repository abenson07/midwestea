"use client";

import { useMemo } from "react";
import { isCloseOutBannerEligible } from "@/lib/leaflets/leafletReadOnly";
import type { LeafletStatus } from "@/types/database";

export function useCloseOutEligible(
  status: LeafletStatus | undefined,
  distributionDate: string | undefined,
): boolean {
  return useMemo(() => {
    if (!status || !distributionDate) return false;
    return isCloseOutBannerEligible(status, distributionDate);
  }, [status, distributionDate]);
}
