"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-sm w-full rounded-2xl shadow p-6 space-y-4">
                <h1 className="text-2xl font-semibold">Sign in</h1>
                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="w-full rounded-xl border px-4 py-2"
                >
                    Continue with Google
                </button>
            </div>
        </main>
    );
}