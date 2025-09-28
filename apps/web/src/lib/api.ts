import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function apiFetch(input: string, init: RequestInit = {}) {
    const session = await getServerSession(authOptions);
    const headers = new Headers(init.headers);
    if (session?.user?.email) headers.set("x-user-email", session.user.email);
    return fetch(`${API_BASE}${input}`, { ...init, headers, cache: "no-store" });
}

export async function apiGet<T>(path: string): Promise<T> {
    const res = await apiFetch(path);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
    const res = await apiFetch(path, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    const res = await apiFetch(path, { method: "PATCH", body: JSON.stringify(body), headers: { "content-type": "application/json" } });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
export async function apiDelete<T>(path: string): Promise<T> {
    const res = await apiFetch(path, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}