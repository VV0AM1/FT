"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AccountCard } from "./account-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { AddAccountDialog } from "./add-account-dialog"
import { EditAccountDialog } from "./edit-account-dialog"

export function AccountsClientPage() {
    const queryClient = useQueryClient()
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editingAccount, setEditingAccount] = useState<any>(null)

    const { data: accounts, isLoading } = useQuery({
        queryKey: ["accounts"],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
            const res = await fetch(`${apiUrl}/accounts`)
            if (!res.ok) throw new Error("Failed to fetch accounts")
            return res.json()
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
            const res = await fetch(`${apiUrl}/accounts/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] })
        }
    })

    const syncMutation = useMutation({
        mutationFn: async (id: string) => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
            const res = await fetch(`${apiUrl}/bank-sync/${id}`, { method: "POST" })
            if (!res.ok) throw new Error("Failed to sync")
            return res.json()
        },
        onSuccess: (data) => {
            alert(`Synced ${data.synced} transactions! New Balance: ${data.newBalance}`)
            queryClient.invalidateQueries({ queryKey: ["accounts"] })
        },
        onError: () => {
            alert("Failed to sync with bank")
        }
    })

    if (isLoading) return <div className="p-8">Loading accounts...</div>

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
                    <p className="text-muted-foreground">
                        Manage your bank accounts and credit cards.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <AddAccountDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
                    <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Account
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {accounts?.map((account: any) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        onEdit={(acc) => {
                            setEditingAccount(acc)
                            setShowEditDialog(true)
                        }}
                        onSync={(id) => syncMutation.mutate(id)}
                        onDelete={(id) => {
                            if (confirm("Delete account?")) deleteMutation.mutate(id)
                        }}
                    />
                ))}
            </div>

            <EditAccountDialog
                account={editingAccount}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />
        </div>
    )
}
