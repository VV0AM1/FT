import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

export function useInstitutions() {
    return useQuery({ queryKey: ["institutions"], queryFn: () => apiGet<any[]>("/institutions") });
}
export function useConnections() {
    return useQuery({ queryKey: ["connections"], queryFn: () => apiGet<any[]>("/connections") });
}
export function useCreateConnection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (institutionId: string) => apiPost("/connections", { institutionId }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
    });
}
export function useSyncAccount() {
    return useMutation({
        mutationFn: (accountId: string) => apiPost(`/accounts/${accountId}/sync`, {}),
    });
}