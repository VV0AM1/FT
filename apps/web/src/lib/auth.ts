import Google from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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