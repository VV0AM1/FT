import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export type Category = { id: string; name: string; parentId?: string | null };

export function useCategories() {
    const qc = useQueryClient();
    const list = useQuery({ queryKey: ["categories"], queryFn: () => apiGet<Category[]>("/categories") });

    const create = useMutation({
        mutationFn: (data: { name: string; parentId?: string | null }) =>
            apiPost<Category>("/categories", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    });

    const update = useMutation({
        mutationFn: (args: { id: string; data: Partial<Pick<Category, "name" | "parentId">> }) =>
            apiPatch<Category>(`/categories/${args.id}`, args.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    });

    const remove = useMutation({
        mutationFn: (id: string) => apiDelete<Category>(`/categories/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    });

    return { list, create, update, remove };
}