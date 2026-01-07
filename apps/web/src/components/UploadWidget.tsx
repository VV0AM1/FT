"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UploadWidget() {
    const { data: session } = useSession();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        if (!session?.user?.email) {
            setMessage({ text: "You must be logged in to upload.", type: "error" });
            return;
        }

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const res = await fetch(`${apiUrl}/documents/upload`, {
                method: "POST",
                headers: {
                    "x-user-email": session.user.email,
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            setMessage({ text: "File uploaded successfully!", type: "success" });
            setFile(null);
            // Optional: Refresh data or trigger AI processing check
            router.refresh();
        } catch (error) {
            console.error(error);
            setMessage({ text: "Error uploading file.", type: "error" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">Upload Documents</h3>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".csv,.pdf,.txt"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                        <span className="text-4xl mb-2">📄</span>
                        {file ? (
                            <span className="font-medium text-[var(--color-primary)]">{file.name}</span>
                        ) : (
                            <span className="text-gray-500">Drag & drop or click to select (PDF, CSV)</span>
                        )}
                    </div>
                </div>

                {uploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-[var(--color-primary)] h-2.5 rounded-full animate-pulse w-full"></div>
                    </div>
                )}

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="bg-[var(--color-primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {uploading ? "Uploading..." : "Process Document"}
                </button>
            </form>
        </div>
    );
}
