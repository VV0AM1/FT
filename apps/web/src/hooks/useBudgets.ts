"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Budget = {
    id: string;
    categoryId: string | null;
    period: "MONTH" | "YEAR";
    amount: number;
    createdAt: string;
    updatedAt: string;
    category?: { id: string; name: string } | null;
    progress?: { spent: number; remaining: number; percent: number };
};

export function useBudgets() {
    const qc = useQueryClient();

    const list = useQuery({
        queryKey: ["budgets"],
        queryFn: async () => {
            const res = await fetch("/api/bridge/budgets", { credentials: "include" });
            if (!res.ok) throw new Error("failed");
            return (await res.json()) as Budget[];
        },
    });

    const create = useMutation({
        mutationFn: async (payload: { categoryId?: string; period: "MONTH" | "YEAR"; amount: number }) => {
            const res = await fetch("/api/bridge/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("failed");
            return res.json();
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
    });

    const update = useMutation({
        mutationFn: async ({ id, ...payload }: { id: string; categoryId?: string; period?: "MONTH" | "YEAR"; amount?: number }) => {
            const res = await fetch(`/api/bridge/budgets/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("failed");
            return res.json();
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
    });

    const remove = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/bridge/budgets/${id}`, { method: "DELETE", credentials: "include" });
            if (!res.ok) throw new Error("failed");
            return res.json();
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
    });

    return { list, create, update, remove };
}