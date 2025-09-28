"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCategories } from "@/hooks/useCategories";
import { useRules } from "@/hooks/useRules";

const catSchema = z.object({ name: z.string().min(1).max(64) });
type CatForm = z.infer<typeof catSchema>;

const ruleSchema = z.object({
    contains: z.string().min(1),
    categoryId: z.string().min(1),
    active: z.boolean().optional(),
});
type RuleForm = z.infer<typeof ruleSchema>;

export default function CategoriesSettings() {
    const { list: cats, create: createCat, remove: removeCat } = useCategories();
    const { list: rules, create: createRule, remove: removeRule } = useRules();

    const cf = useForm<CatForm>({ resolver: zodResolver(catSchema), defaultValues: { name: "" } });
    const rf = useForm<RuleForm>({ resolver: zodResolver(ruleSchema), defaultValues: { contains: "", categoryId: "" } });

    return (
        <div className="space-y-8">
            <section>
                <h1 className="text-xl font-semibold mb-2">Categories</h1>
                <form
                    className="flex gap-2"
                    onSubmit={cf.handleSubmit(async (data) => {
                        await createCat.mutateAsync({ name: data.name });
                        cf.reset();
                    })}
                >
                    <input className="border rounded px-3 py-2" placeholder="New category name" {...cf.register("name")} />
                    <button className="border rounded px-3 py-2" type="submit" disabled={createCat.isPending}>Add</button>
                </form>

                <ul className="mt-4 divide-y">
                    {cats.data?.map((c) => (
                        <li key={c.id} className="flex items-center justify-between py-2">
                            <span>{c.name}</span>
                            <button className="text-red-600" onClick={() => removeCat.mutate(c.id)}>&times;</button>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-2">Rules</h2>
                <form
                    className="flex flex-wrap gap-2 items-center"
                    onSubmit={rf.handleSubmit(async (data) => {
                        await createRule.mutateAsync({ contains: data.contains, categoryId: data.categoryId, active: true });
                        rf.reset();
                    })}
                >
                    <input className="border rounded px-3 py-2" placeholder="Description contains…" {...rf.register("contains")} />
                    <select className="border rounded px-3 py-2" {...rf.register("categoryId")}>
                        <option value="">Choose category…</option>
                        {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button className="border rounded px-3 py-2" type="submit">Add Rule</button>
                </form>

                <ul className="mt-4 divide-y">
                    {rules.data?.map((r) => (
                        <li key={r.id} className="flex items-center justify-between py-2">
                            <div>
                                <div className="font-medium">if contains “{r.contains}” → {r.category?.name ?? r.categoryId}</div>
                                {!r.active && <span className="text-xs text-gray-500">inactive</span>}
                            </div>
                            <button className="text-red-600" onClick={() => removeRule.mutate(r.id)}>&times;</button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}