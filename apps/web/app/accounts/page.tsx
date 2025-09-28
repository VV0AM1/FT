"use client";
import { useAccounts } from "@/hooks/useAccounts";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    openingBalance: z.coerce.number().optional(),
});
type Form = z.infer<typeof schema>;

export default function AccountsPage() {
    const { list, create } = useAccounts();
    const f = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { name: "", type: "CHECKING" } });

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Accounts</h1>

            <form
                className="flex flex-wrap gap-2 items-center"
                onSubmit={f.handleSubmit(async (data) => {
                    await create.mutateAsync(data);
                    f.reset({ name: "", type: "CHECKING", openingBalance: undefined });
                })}
            >
                <input className="border rounded px-3 py-2" placeholder="Name" {...f.register("name")} />
                <select className="border rounded px-3 py-2" {...f.register("type")}>
                    <option>CHECKING</option>
                    <option>SAVINGS</option>
                    <option>CREDIT</option>
                    <option>CASH</option>
                    <option>OTHER</option>
                </select>
                <input className="border rounded px-3 py-2" placeholder="Opening balance" {...f.register("openingBalance")} />
                <button className="border rounded px-3 py-2" type="submit" disabled={create.isPending}>Create</button>
            </form>

            <ul className="divide-y">
                {list.data?.map((a) => (
                    <li key={a.id} className="flex justify-between py-2">
                        <div>
                            <div className="font-medium">{a.name}</div>
                            <div className="text-xs text-gray-500">{a.type}</div>
                        </div>
                        <div className="tabular-nums">{a.balance}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}