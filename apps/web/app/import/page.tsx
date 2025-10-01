"use client";
import { useState } from "react";
import { useImports } from "@/hooks/useImports";

export default function ImportPage() {
    const { list, presign, complete } = useImports();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleFiles(files: FileList | null) {
        if (!files || !files.length) return;
        setError(null);
        setBusy(true);
        try {
            const file = files[0];
            const pre = await presign.mutateAsync({
                filename: file.name,
                contentType: file.type || "application/octet-stream",
                size: file.size,
            });

            const fd = new FormData();
            Object.entries(pre.fields).forEach(([k, v]) => fd.append(k, v));
            fd.append("file", file);

            const s3Resp = await fetch(pre.url, { method: "POST", body: fd });
            if (!s3Resp.ok) throw new Error(`S3 upload failed (${s3Resp.status})`);

            await complete.mutateAsync({
                key: pre.key,
                filename: file.name,
                size: file.size,
                contentType: file.type || "application/octet-stream",
            });
        } catch (e: any) {
            setError(e.message ?? "Upload failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <h1 className="text-xl font-semibold">Import</h1>

                <label
                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                    onDragOver={(e) => e.preventDefault()}
                    className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer ${busy ? "opacity-60" : ""}`}
                >
                    <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                        accept=".csv,.ofx,.qif,.qfx,application/octet-stream,text/csv"
                        disabled={busy}
                    />
                    <div>Drag & drop a file here, or click to choose</div>
                    <div className="text-xs text-gray-500 mt-1">CSV/OFX/QIF</div>
                </label>

                {error && <div className="text-red-600 text-sm">{error}</div>}
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-2">History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="py-2">File</th>
                                <th className="py-2">Size</th>
                                <th className="py-2">Status</th>
                                <th className="py-2">Uploaded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.data?.map((f) => (
                                <tr key={f.id} className="border-b last:border-0">
                                    <td className="py-2">{f.filename}</td>
                                    <td className="py-2">{(f.size / 1024).toFixed(1)} KB</td>
                                    <td className="py-2">{f.status}</td>
                                    <td className="py-2">{new Date(f.uploadedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {!list.data?.length && (
                                <tr><td className="py-6 text-gray-500" colSpan={4}>No imports yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}