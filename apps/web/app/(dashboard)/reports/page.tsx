"use client";

import UploadWidget from "@/components/UploadWidget";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ReportsPage() {
    // const { data: session } = useSession(); // Temporarily removed to fix Context error
    const [documents, setDocuments] = useState([]);

    // Mock fetching existing docs
    useEffect(() => {
        // In future: fetch('/documents')
    }, []);

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">Financial Reports</h1>
                <p className="text-gray-500 mt-2">Upload and manage your financial documents here.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">Upload New Report</h2>
                    <UploadWidget />
                </section>

                <section className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--color-border)]">
                    <h2 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">Recent Documents</h2>
                    <div className="text-gray-500 italic text-center py-10">
                        No documents found. Upload one to get started!
                    </div>
                </section>
            </div>

        </div>
    );
}
