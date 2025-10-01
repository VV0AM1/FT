import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export type SpendByCategory = { categoryId: string | null; categoryName: string | null; spend: string | number };
export type MonthlyTrend = { month: string; income: string | number; spend: string | number };

export function useSpendByCategory(params: { from?: string; to?: string }) {
    const qs = new URLSearchParams(params as Record<string, string>);
    return useQuery({
        queryKey: ["analytics", "spend-by-category", params],
        queryFn: () => apiGet<SpendByCategory[]>(`/analytics/spend-by-category?${qs.toString()}`),
        staleTime: 15 * 60 * 1000,
    });
}

export function useMonthlyTrend(year: number) {
    return useQuery({
        queryKey: ["analytics", "monthly-trend", year],
        queryFn: () => apiGet<MonthlyTrend[]>(`/analytics/monthly-trend?year=${year}`),
        staleTime: 15 * 60 * 1000,
    });
}