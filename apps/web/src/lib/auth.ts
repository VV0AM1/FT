import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "OTP",
            credentials: {
                email: { label: "Email", type: "email" },
                token: { label: "Code", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.token) return null;

                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
                    const res = await fetch(`${apiUrl}/auth/otp/verify`, {
                        method: "POST",
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" },
                    });

                    const user = await res.json();

                    if (res.ok && user && user.id) {
                        return user;
                    }
                    return null;
                } catch (e) {
                    console.error("Auth error", e);
                    return null;
                }
            },
        }),
    ],
    pages: { signIn: "/auth/signin" },
    session: { strategy: "jwt" },
    callbacks: {
        async session({ session, token }) {
            if (session.user) (session.user as any).id = token.sub;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};