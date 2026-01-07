"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"email" | "code">("email");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const res = await fetch(`${apiUrl}/auth/otp/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStep("code");
            } else {
                alert("Failed to send code. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Error sending code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn("credentials", {
            email,
            token: code,
            redirect: false,
        });

        if (res?.ok) {
            router.push("/");
            router.refresh();
        } else {
            alert("Invalid code. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 shadow rounded-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-emerald-900">
                        {step === "email" ? "Sign in or Create Account" : "Enter Verification Code"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {step === "email"
                            ? "Enter your email to receive a login code"
                            : `We sent a code to ${email}`}
                    </p>
                </div>

                {step === "email" ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                                placeholder="Email address"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex w-full justify-center rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-70 transition-colors"
                            >
                                {loading ? "Sending..." : "Send Code"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleVerify}>
                        <div>
                            <label htmlFor="code" className="sr-only">Code</label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 text-center tracking-widest text-2xl"
                                placeholder="000000"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex w-full justify-center rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-70 transition-colors"
                            >
                                {loading ? "Verifying..." : "Verify & Sign In"}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="w-full text-center text-sm text-[var(--color-primary)] hover:text-emerald-700"
                        >
                            Back to Email
                        </button>
                    </form>
                )}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div>
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                            <path
                                d="M12.0003 20.45c4.6667 0 8.0167-3.2333 8.0167-7.9667 0-.75-.0667-1.4667-.1834-2.1667H12.0003v4.1334h4.5167c-.2 1.05-.8 1.9333-1.7 2.5333l2.7167 2.1c1.6-1.4833 2.4833-3.6667 2.4833-6.1833 0-6.6167-5.3833-12-12-12s-12 5.3833-12 12 5.3833 12 12 12z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12.0003 24c3.25 0 5.9667-1.0667 7.9667-2.9167l-2.7167-2.1c-1.0667.7333-2.4333 1.1833-4.0167 1.1833-3.1333 0-5.7833-2.1167-6.7333-4.9667H2.6503v2.6333c1.9667 3.9167 6.0167 6.1667 10.5833 6.1667z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.2669 15.2c-.2333-.7-.3666-1.45-.3666-2.2s.1333-1.5.3666-2.2V8.1667H2.6502c-.85 1.7-1.3333 3.6-1.3333 5.6s.4833 3.9 1.3333 5.6l2.6167-4z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12.0003 4.75c1.7667 0 3.35.6 4.6 1.7833l3.4167-3.4167C17.9669 1.1833 15.2503 0 12.0003 0 7.4336 0 3.3836 2.25 1.4169 6.1667l2.6167 2.0333c.95-2.85 3.6-4.9667 6.7333-4.9667z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
}