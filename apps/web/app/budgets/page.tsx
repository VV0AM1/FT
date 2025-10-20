"use client";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
    categoryId: z.string().optional().or(z.literal("")),
    period: z.enum(["MONTH", "YEAR"]),
    amount: z.coerce.number().min(0),
});
type Form = z.infer<typeof schema>;

export default function BudgetsPage() {
    const { list, create, remove } = useBudgets();
    const cats = useCategories();

    const f = useForm<Form>({
        resolver: zodResolver(schema) as any,
        defaultValues: { categoryId: "", period: "MONTH", amount: 0 },
    });

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Budgets</h1>

            <form
                className="flex flex-wrap gap-2 items-center"
                onSubmit={f.handleSubmit(async (data) => {
                    await create.mutateAsync({
                        categoryId: data.categoryId || undefined,
                        period: data.period,
                        amount: data.amount,
                    });
                    f.reset({ categoryId: "", period: "MONTH", amount: 0 });
                })}
            >
                <select className="border rounded px-3 py-2" {...f.register("categoryId")}>
                    <option value="">(All categories)</option>
                    {cats.list.data?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select className="border rounded px-3 py-2" {...f.register("period")}>
                    <option value="MONTH">Monthly</option>
                    <option value="YEAR">Yearly</option>
                </select>

                <input className="border rounded px-3 py-2" placeholder="Amount" {...f.register("amount")} />
                <button className="border rounded px-3 py-2" type="submit" disabled={create.isPending}>Add</button>
            </form>

            <div className="divide-y">
                {list.data?.map((b) => (
                    <div key={b.id} className="py-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-medium">
                                    {b.category?.name ?? "All categories"} — {b.period.toLowerCase()}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Budget: {b.amount.toFixed(2)} • Spent: {b.progress?.spent.toFixed(2) ?? "0.00"} • Remaining: {b.progress?.remaining.toFixed(2) ?? "0.00"}
                                </div>
                            </div>
                            <button
                                className="text-red-600 text-sm"
                                onClick={() => remove.mutate(b.id)}
                                disabled={remove.isPending}
                            >
                                Delete
                            </button>
                        </div>

                        <div className="h-2 bg-gray-200 rounded mt-2">
                            <div
                                className="h-2 bg-blue-500 rounded"
                                style={{ width: `${Math.min(100, b.progress?.percent ?? 0)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}