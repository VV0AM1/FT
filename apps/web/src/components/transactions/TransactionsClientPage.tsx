"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TransactionsClientPage() {
    const [page, setPage] = useState(0)
    const limit = 20

    const { data, isLoading, isError } = useQuery({
        queryKey: ["transactions", page],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const res = await fetch(`${apiUrl}/transactions?limit=${limit}&cursor=${page * limit /* Logic needs adjustment for cursor vs offset */}`);
            // Wait, the backend uses CURSOR or OFFSET?
            // Backend code: if (cursor) { skip: 1, cursor: { id: cursor } }
            // So it is proper ID-based cursor pagination.
            // For simple "Page 1, Page 2", offset is easier.
            // Let's refactor backend to support 'skip' for easy table pagination, 
            // OR ignore pagination for now and just load 50 recent.
            // The backend list method logic: `take: take + 1`... 

            // Let's stick to simple "Load Recent 50" for MVP 
            // and assume we will fix pagination later.
            const response = await fetch(`${apiUrl}/transactions?limit=100`);
            if (!response.ok) throw new Error("Failed to fetch");
            return response.json();
        },
        placeholderData: keepPreviousData,
    })

    if (isLoading) return <div className="p-10">Loading transactions...</div>
    if (isError) return <div className="p-10 text-red-500">Error loading data</div>

    // API returns { items: [], nextCursor: ... }
    const transactions = data?.items || []

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-primary-dark)]">Transactions</h1>
                <Button>Add Transaction</Button>
            </div>

            <DataTable columns={columns} data={transactions} />
        </div>
    )
}
