"use client";
import { useNotificationPrefs } from "@/hooks/useNotifications";

export default function NotificationSettings() {
    const { prefs, update } = useNotificationPrefs();
    const p = prefs.data;

    if (prefs.isLoading) return <div>Loading…</div>;

    const toggle = (k: string) => update.mutate({ [k]: !p[k] });

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold">Notifications</h2>

            <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!p.budgetAlertsEnabled} onChange={() => toggle("budgetAlertsEnabled")} />
                Budget alerts enabled
            </label>

            <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!p.threshold80Enabled} onChange={() => toggle("threshold80Enabled")} />
                Alert at 80%
            </label>

            <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!p.threshold100Enabled} onChange={() => toggle("threshold100Enabled")} />
                Alert at 100%
            </label>

            <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!p.emailEnabled} onChange={() => toggle("emailEnabled")} />
                Email
            </label>

            <WebPushBlock enabled={!!p.webPushEnabled} />
        </div>
    );
}

function WebPushBlock({ enabled }: { enabled: boolean }) {
    const enable = async () => {
        // get public key
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        await fetch("/api/bridge/notifications/webpush/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                endpoint: sub.endpoint,
                p256dh: arrayBufferToBase64(sub.getKey("p256dh")!),
                auth: arrayBufferToBase64(sub.getKey("auth")!),
            }),
        });
    };

    return (
        <div className="mt-2">
            <div className="text-sm">Web Push: {enabled ? "Enabled" : "Disabled"}</div>
            <button className="border rounded px-3 py-1 mt-1" onClick={enable}>Enable Web Push</button>
        </div>
    );
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
    return arr;
}
function arrayBufferToBase64(buf: ArrayBuffer) {
    const bytes = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
}