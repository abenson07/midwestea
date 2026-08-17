"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardData, ChartDataPoint, TableRow } from "@/data/dashboard";
import { getApiBase } from "@/lib/apiBase";

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(`${getApiBase()}/api/dashboard/membership-metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }
  return response.json();
}

export const useDashboard = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  const chartData: ChartDataPoint[] =
    data?.metrics.map((m) => ({
      month: m.monthLabel,
      membershipRevenue: m.membershipRevenue,
      otherRevenue: m.otherRevenue,
    })) || [];

  const membershipTableRows: TableRow[] = [
    {
      label: "New Memberships",
      values: data?.metrics.map((m) => m.newMemberships) || [],
    },
    {
      label: "Renewals",
      values: data?.metrics.map((m) => m.renewals) || [],
    },
    {
      label: "Churns",
      values: data?.metrics.map((m) => m.churns) || [],
    },
  ];

  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const productTableRows: TableRow[] =
    (data?.productAverages || []).map((product) => ({
      label: product.productName,
      values: monthOrder.map(
        (month) => product.monthlyAverages[month as keyof typeof product.monthlyAverages] || 0
      ),
    }));

  const membershipMonthLabels = data?.metrics.map((m) => m.monthLabel) || [];
  const productMonthLabels = monthOrder.map((month) => month.substring(0, 3).toUpperCase());

  return {
    data: data ?? null,
    chartData,
    membershipTableRows,
    membershipMonthLabels,
    productTableRows,
    productMonthLabels,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch dashboard data") : null,
    refetch: async () => {
      await refetch();
    },
  };
};
