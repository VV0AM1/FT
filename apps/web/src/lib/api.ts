import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function apiFetchServer(input: string, init: RequestInit = {}) {
    const session = await getServerSession(authOptions);
    const headers = new Headers(init.headers);
    if (session?.user?.email) headers.set("x-user-email", session.user.email);
    return fetch(`${API_BASE}${input}`, { ...init, headers, cache: "no-store" });
}

export async function apiFetch(input: string, init: RequestInit = {}) {
    return fetch(`/api/bridge${input.startsWith("/") ? "" : "/"}${input}`, {
        ...init,
        headers: { "content-type": "application/json", ...(init.headers || {}) },
        credentials: "include",
    });
}

export async function apiGet<T>(path: string): Promise<T> {
    const r = await apiFetch(path);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
    const r = await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}
export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    const r = await apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}
export async function apiDelete<T>(path: string): Promise<T> {
    const r = await apiFetch(path, { method: "DELETE" });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}