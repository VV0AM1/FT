import { PrismaClient } from "@prisma/client";
import webpush from "web-push";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

type JobPayload = { userId: string; subject: string; text: string; html?: string };

export async function sendNotificationJob(data: JobPayload) {
    const prefs = await prisma.notificationPref.upsert({
        where: { userId: data.userId }, update: {}, create: { userId: data.userId },
    });

    if (prefs.emailEnabled) {
        if (process.env.RESEND_API_KEY) {
            await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: process.env.NOTIFY_FROM_EMAIL ?? "notify@example.com",
                    to: await emailForUser(data.userId),
                    subject: data.subject,
                    html: data.html ?? `<p>${escapeHtml(data.text)}</p>`,
                }),
            }).catch(e => console.error("[notify] resend failed", e));
        } else if (process.env.SMTP_HOST) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT ?? 1025),
                secure: false,
                auth: process.env.SMTP_USER
                    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                    : undefined,
            });
            await transporter.sendMail({
                from: process.env.NOTIFY_FROM_EMAIL ?? "notify@local.test",
                to: await emailForUser(data.userId),
                subject: data.subject,
                html: data.html ?? `<p>${escapeHtml(data.text)}</p>`,
                text: data.text,
            }).catch(e => console.error("[notify] smtp failed", e));
        } else {
            console.log("[notify] email skipped (no RESEND_API_KEY and no SMTP_HOST)");
        }
    }

    if (
        prefs.webPushEnabled &&
        process.env.VAPID_PUBLIC_KEY &&
        process.env.VAPID_PRIVATE_KEY &&
        process.env.VAPID_SUBJECT
    ) {
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT,
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        const subs = await prisma.webPushSubscription.findMany({ where: { userId: data.userId } });
        await Promise.all(
            subs.map(s =>
                webpush
                    .sendNotification(
                        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
                        JSON.stringify({ title: data.subject, body: data.text })
                    )
                    .catch(e => console.warn("[notify] webpush failed", e))
            )
        );
    }
}

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}
async function emailForUser(userId: string): Promise<string> {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    return u?.email ?? "test@example.com";
}