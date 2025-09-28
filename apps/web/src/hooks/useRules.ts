import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export type Rule = { id: string; contains: string; active: boolean; categoryId: string; category?: { id: string; name: string } };

export function useRules() {
    const qc = useQueryClient();
    const list = useQuery({ queryKey: ["rules"], queryFn: () => apiGet<Rule[]>("/rules") });

    const create = useMutation({
        mutationFn: (data: { contains: string; categoryId: string; active?: boolean }) =>
            apiPost<Rule>("/rules", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["rules"] }),
    });

    const update = useMutation({
        mutationFn: (args: { id: string; data: Partial<Pick<Rule, "contains" | "categoryId" | "active">> }) =>
            apiPatch<Rule>(`/rules/${args.id}`, args.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["rules"] }),
    });

    const remove = useMutation({
        mutationFn: (id: string) => apiDelete<Rule>(`/rules/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["rules"] }),
    });

    return { list, create, update, remove };
}