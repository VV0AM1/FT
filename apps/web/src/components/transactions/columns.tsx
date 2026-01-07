"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTableRowActions } from "./data-table-row-actions"

export type Transaction = {
    id: string
    amount: number
    description: string
    date: string
    category?: { name: string }
    account?: { name: string }
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            return new Date(row.getValue("date")).toLocaleDateString()
        }
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "category.name",
        header: "Category",
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", // Todo: Dynamic currency
            }).format(amount)

            return <div className={amount < 0 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>{formatted}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row.original} />,
    },
]
