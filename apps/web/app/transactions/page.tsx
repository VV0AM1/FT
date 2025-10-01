"use client";
import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";

export default function TransactionsPage() {
    const [filters, setFilters] = useState<{ from?: string; to?: string; accountId?: string; categoryId?: string; q?: string }>({});
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useTransactions(filters);
    const cats = useCategories().list.data ?? [];
    const accts = useAccounts().list.data ?? [];

    const rows = (data?.pages ?? []).flatMap(p => p.items);

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold">Transactions</h1>

            <form
                className="grid md:grid-cols-5 gap-2"
                onSubmit={(e) => { e.preventDefault(); refetch(); }}
            >
                <input className="border rounded px-3 py-2" type="date" onChange={(e) => setFilters(f => ({ ...f, from: e.target.value || undefined }))} />
                <input className="border rounded px-3 py-2" type="date" onChange={(e) => setFilters(f => ({ ...f, to: e.target.value || undefined }))} />
                <select className="border rounded px-3 py-2" onChange={(e) => setFilters(f => ({ ...f, accountId: e.target.value || undefined }))}>
                    <option value="">All accounts</option>
                    {accts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select className="border rounded px-3 py-2" onChange={(e) => setFilters(f => ({ ...f, categoryId: e.target.value || undefined }))}>
                    <option value="">All categories</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input className="border rounded px-3 py-2" placeholder="Search…" onChange={(e) => setFilters(f => ({ ...f, q: e.target.value || undefined }))} />
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="py-2">Date</th>
                            <th className="py-2">Account</th>
                            <th className="py-2">Description</th>
                            <th className="py-2 text-right">Amount</th>
                            <th className="py-2">Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(tx => (
                            <tr key={tx.id} className="border-b last:border-0">
                                <td className="py-2">{new Date(tx.date).toLocaleDateString()}</td>
                                <td className="py-2">{tx.account?.name ?? "—"}</td>
                                <td className="py-2">{tx.description}</td>
                                <td className="py-2 text-right">{tx.amount}</td>
                                <td className="py-2">{tx.category?.name ?? "—"}</td>
                            </tr>
                        ))}
                        {!rows.length && <tr><td className="py-8 text-center text-gray-500" colSpan={5}>No transactions</td></tr>}
                    </tbody>
                </table>
            </div>

            {hasNextPage && (
                <button
                    className="border rounded px-3 py-2"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage ? "Loading…" : "Load more"}
                </button>
            )}
        </div>
    );
}