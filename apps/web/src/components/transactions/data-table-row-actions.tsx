"use client"

import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Pen, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { EditTransactionDialog } from "./edit-transaction-dialog"

interface DataTableRowActionsProps<TData> {
    row: TData
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const transaction = row as any
    const queryClient = useQueryClient()
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;
        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            await fetch(`${apiUrl}/transactions/${transaction.id}`, {
                method: "DELETE",
            });
            queryClient.invalidateQueries({ queryKey: ["transactions"] })
        } catch (error) {
            console.error("Failed to delete", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <EditTransactionDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                transaction={transaction}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8 w-auto px-2 text-black border-gray-400">
                        <MoreHorizontal className="mr-2 h-4 w-4 text-black" />
                        <span className="text-xs">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id)}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                        <Pen className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
