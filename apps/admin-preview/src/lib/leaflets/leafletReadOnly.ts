import type { LeafletStatus } from "@/types/database";

export function isLeafletReadOnly(status: LeafletStatus): boolean {
  return status === "closed";
}

export function daysUntilDistribution(distributionDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${distributionDate}T00:00:00`);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isCloseOutBannerEligible(
  status: LeafletStatus,
  distributionDate: string,
): boolean {
  if (status !== "active") return false;
  return daysUntilDistribution(distributionDate) <= -14;
}
