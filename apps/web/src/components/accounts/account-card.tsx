"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { MoreHorizontal, Pen, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Account {
    id: string
    name: string
    type: string
    balance: number
}

interface AccountCardProps {
    account: Account
    onEdit: (account: Account) => void
    onDelete: (id: string) => void
    onSync: (id: string) => void
}

export function AccountCard({ account, onEdit, onDelete, onSync }: AccountCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {account.name}
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 flex items-center justify-center rounded-sm hover:bg-white/20 transition-colors focus:outline-none">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-5 w-5" color="#FFFFFF" strokeWidth={3} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSync(account.id)}>
                            Sync with Bank
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(account)}>
                            <Pen className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(account.id)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(account.balance)}
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                    {account.type.toLowerCase()}
                </p>
            </CardContent>
        </Card>
    )
}
