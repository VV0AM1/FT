"use client"

import { useState, useEffect } from "react"
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

interface EditAccountDialogProps {
    account: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditAccountDialog({
    account,
    open,
    onOpenChange,
}: EditAccountDialogProps) {
    const queryClient = useQueryClient()
    const { register, handleSubmit, control, reset, setValue } = useForm({
        defaultValues: {
            name: "",
            type: "Checking",
        }
    })
    const [loading, setLoading] = useState(false)

    // Update form when account prop changes
    useEffect(() => {
        if (account) {
            setValue("name", account.name)
            setValue("type", account.type) // Ensure casing matches "Checking" vs "CHECKING"
        }
    }, [account, setValue])

    const onSubmit = async (data: any) => {
        if (!account) return
        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const res = await fetch(`${apiUrl}/accounts/${account.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: data.name,
                    type: data.type,
                })
            })

            if (!res.ok) throw new Error("Failed to update account")

            queryClient.invalidateQueries({ queryKey: ["accounts"] })
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update account", error)
            alert("Failed to update account")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Account</DialogTitle>
                    <DialogDescription>
                        Update account details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="edit-name"
                                className="col-span-3 text-gray-900"
                                placeholder="e.g. Chase Sapphire"
                                {...register("name", { required: true })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-type" className="text-right">
                                Type
                            </Label>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
