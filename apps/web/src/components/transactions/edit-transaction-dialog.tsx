"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQueryClient } from "@tanstack/react-query"
import { Transaction } from "./columns" // Import type

interface EditTransactionDialogProps {
    transaction: Transaction
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTransactionDialog({
    transaction,
    open,
    onOpenChange,
}: EditTransactionDialogProps) {
    const queryClient = useQueryClient()
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : "",
        }
    })
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data: any) => {
        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const res = await fetch(`${apiUrl}/transactions/${transaction.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...data,
                    amount: parseFloat(data.amount),
                    date: new Date(data.date).toISOString()
                })
            })

            if (!res.ok) throw new Error("Failed to update")

            queryClient.invalidateQueries({ queryKey: ["transactions"] })
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update transaction", error)
            alert("Failed to update transaction")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>
                        Make changes to your transaction here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                className="col-span-3 text-gray-900"
                                {...register("date", { required: true })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                className="col-span-3 text-gray-900"
                                {...register("description", { required: true })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                className="col-span-3 text-gray-900"
                                {...register("amount", { required: true })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
