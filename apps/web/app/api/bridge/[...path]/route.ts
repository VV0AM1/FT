import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";
const hopByHop = new Set(["connection", "keep-alive", "transfer-encoding", "upgrade"]);

export async function handler(
    req: NextRequest,
    ctx: { params: Promise<{ path: string[] }> }
) {
    const { path } = await ctx.params;
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? "";

    const target = `${API_BASE}/${path.join("/")}${req.nextUrl.search}`;


    const headers = new Headers();
    req.headers.forEach((v, k) => {
        const lk = k.toLowerCase();
        if (!hopByHop.has(lk) && lk !== "host") headers.set(k, v);
    });
    if (email) headers.set("x-user-email", email);

    const init: RequestInit = {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
        redirect: "manual",
    };

    const upstream = await fetch(target, init);
    const respHeaders = new Headers();
    upstream.headers.forEach((v, k) => {
        if (!hopByHop.has(k.toLowerCase())) respHeaders.set(k, v);
    });

    return new NextResponse(await upstream.arrayBuffer(), {
        status: upstream.status,
        headers: respHeaders,
    });
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };