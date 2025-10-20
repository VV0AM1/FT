"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useNotificationPrefs() {
    const qc = useQueryClient();
    const prefs = useQuery({
        queryKey: ["prefs"],
        queryFn: async () => {
            const r = await fetch("/api/bridge/notifications/prefs");
            return r.json();
        },
    });

    const update = useMutation({
        mutationFn: async (patch: any) => {
            const r = await fetch("/api/bridge/notifications/prefs", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            return r.json();
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["prefs"] }),
    });

    return { prefs, update };
}