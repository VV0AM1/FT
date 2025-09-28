import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

export type Account = { id: string; name: string; type: string; balance: string };

export function useAccounts() {
    const qc = useQueryClient();
    const list = useQuery({ queryKey: ["accounts"], queryFn: () => apiGet<Account[]>("/accounts") });

    const create = useMutation({
        mutationFn: (data: { name: string; type: string; openingBalance?: number }) =>
            apiPost<Account>("/accounts", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
    });

    return { list, create };
}