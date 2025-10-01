"use client";
import { useAccounts } from "@/hooks/useAccounts";
import { useConnections, useCreateConnection, useInstitutions, useSyncAccount } from "@/hooks/useConnections"; import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    openingBalance: z.number().optional(),
});
type Form = z.infer<typeof schema>;

export default function AccountsPage() {
    const accounts = useAccounts();
    const inst = useInstitutions();
    const sync = useSyncAccount();
    const connections = useConnections();
    const { list, create } = useAccounts();
    const f = useForm<Form>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", type: "CHECKING", openingBalance: undefined },
    });

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

                <input
                    type="number"
                    className="border rounded px-3 py-2"
                    placeholder="Opening balance"
                    {...f.register("openingBalance", { valueAsNumber: true })}
                />

                <button className="border rounded px-3 py-2" type="submit" disabled={create.isPending}>
                    Create
                </button>
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
            <div className="border rounded p-4 space-y-3">
                <h2 className="font-semibold">Connect a mock bank</h2>
                <div className="flex gap-2 flex-wrap">
                    {inst.data?.map(i => (
                        <button key={i.id} className="border rounded px-3 py-2"
                            onClick={() => create.mutate(i.id)} disabled={create.isPending}>
                            {i.logo} {i.name}
                        </button>
                    ))}
                </div>

                <div>
                    <h3 className="font-medium mt-2 mb-1">Connections</h3>
                    <ul className="text-sm list-disc pl-5">
                        {connections.data?.map((c: any) => (
                            <li key={c.id}>{c.institutionId} · {new Date(c.createdAt).toLocaleString()}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border rounded p-4 space-y-2">
                <h2 className="font-semibold">Sync an account</h2>
                <div className="flex gap-2 flex-wrap">
                    {accounts.list.data?.map(a => (
                        <button key={a.id} className="border rounded px-3 py-2"
                            onClick={() => sync.mutate(a.id)} disabled={sync.isPending}>
                            Sync {a.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

