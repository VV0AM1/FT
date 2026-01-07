"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useQueryClient } from "@tanstack/react-query"

interface AddAccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddAccountDialog({
    open,
    onOpenChange,
}: AddAccountDialogProps) {
    const queryClient = useQueryClient()
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            type: "Checking",
            openingBalance: "0",
        }
    })
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data: any) => {
        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const res = await fetch(`${apiUrl}/accounts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: data.name,
                    type: data.type,
                    openingBalance: parseFloat(data.openingBalance)
                })
            })

            if (!res.ok) throw new Error("Failed to create account")

            queryClient.invalidateQueries({ queryKey: ["accounts"] })
            reset()
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create account", error)
            alert("Failed to create account")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Account</DialogTitle>
                    <DialogDescription>
                        Add a new bank account or credit card to track.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                className="col-span-3 text-gray-900"
                                placeholder="e.g. Chase Sapphire"
                                {...register("name", { required: true })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="col-span-3 text-gray-900">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Checking">Checking</SelectItem>
                                            <SelectItem value="Savings">Savings</SelectItem>
                                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                                            <SelectItem value="Investment">Investment</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="openingBalance" className="text-right">
                                Balance
                            </Label>
                            <Input
                                id="openingBalance"
                                type="number"
                                step="0.01"
                                className="col-span-3 text-gray-900"
                                {...register("openingBalance")}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
