import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

export type ImportFile = {
    id: string; filename: string; key: string;
    size: number; contentType: string; status: "PENDING" | "PROCESSED" | "FAILED"; uploadedAt: string;
};

export function useImports() {
    const qc = useQueryClient();
    const list = useQuery({ queryKey: ["imports"], queryFn: () => apiGet<ImportFile[]>("/imports") });

    const presign = useMutation({
        mutationFn: (body: { filename: string; contentType: string; size: number }) =>
            apiPost<{ url: string; fields: Record<string, string>; key: string; bucket: string }>("/imports", body),
    });

    const complete = useMutation({
        mutationFn: (body: { key: string; filename: string; size: number; contentType: string }) =>
            apiPost<ImportFile>("/imports/complete", body),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["imports"] }),
    });

    return { list, presign, complete };
}