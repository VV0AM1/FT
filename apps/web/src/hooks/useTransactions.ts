import { useInfiniteQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export type Txn = {
    id: string;
    date: string;
    description: string | null;
    amount: string;
    category?: { id: string; name: string } | null;
    account?: { id: string; name: string } | null;
};

export function useTransactions(filters: Record<string, string | undefined>) {
    const query = useInfiniteQuery({
        queryKey: ["transactions", filters],
        queryFn: ({ pageParam }) => {
            const p = new URLSearchParams({ ...filters, limit: "50" });
            if (pageParam) p.set("cursor", pageParam);
            return apiGet<{ items: Txn[]; nextCursor: string | null }>(`/transactions?${p.toString()}`);
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
    });
    return query;
}