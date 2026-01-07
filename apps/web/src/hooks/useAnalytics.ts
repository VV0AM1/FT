import { useQuery } from "@tanstack/react-query";

interface AnalyticsResponse {
    currentMonth: { income: number; expense: number; net: number };
    previousMonth: { income: number; expense: number; net: number };
    trends: { incomeChange: number; expenseChange: number };
    categories: { name: string; value: number }[];
    history: { date: string; income: number; expense: number }[];
}

export function useAnalyticsData(month?: number, year?: number) {
    return useQuery<AnalyticsResponse>({
        queryKey: ["analytics", "dashboard", month, year],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            let url = `${apiUrl}/analytics/dashboard`;
            if (month && year) {
                url += `?month=${month}&year=${year}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch analytics");
            return res.json();
        },
    });
}