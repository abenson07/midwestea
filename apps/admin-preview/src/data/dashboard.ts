/**
 * Dashboard data types for membership metrics and charts
 */

export interface Metric {
  monthLabel: string;
  membershipRevenue: number;
  otherRevenue: number;
  newMemberships: number;
  renewals: number;
  churns: number;
}

export interface ProductAverage {
  productName: string;
  monthlyAverages: Record<string, number>;
}

export interface DashboardData {
  metrics: Metric[];
  productAverages?: ProductAverage[];
}

export interface ChartDataPoint {
  month: string;
  membershipRevenue: number;
  otherRevenue: number;
}

export interface TableRow {
  label: string;
  values: number[];
}
