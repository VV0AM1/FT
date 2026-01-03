import { PrismaClient } from "@prisma/client";
import webpush from "web-push";
import fetch from "node-fetch";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

type JobPayload = {
    userId: string;
    subject: string;
    text: string;
    html?: string;
};

export async function sendNotificationJob(data: JobPayload) {
    const prefs = await prisma.notificationPref.upsert({
        where: { userId: data.userId },
        update: {},
        create: { userId: data.userId },
    });

    const html = data.html ?? `<p>${escapeHtml(data.text)}</p>`;
    const to = await emailForUser(data.userId);
    const from = process.env.NOTIFY_FROM_EMAIL ?? "Finance Tracker <notify@local.test>";

    if (prefs.emailEnabled && process.env.RESEND_API_KEY) {
        try {
            await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ from, to, subject: data.subject, html }),
            });
        } catch (e) {
            console.error("[notify] resend failed", e);
        }
    }

    if (prefs.emailEnabled && process.env.SMTP_HOST) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT ?? 1025),
                secure: false,
            });
            await transporter.sendMail({
                from,
                to,
                subject: data.subject,
                html,
                text: data.text,
            });
        } catch (e) {
            console.error("[notify] smtp failed", e);
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
            subs.map(async (s) => {
                try {
                    await webpush.sendNotification(
                        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
                        JSON.stringify({ title: data.subject, body: data.text })
                    );
                } catch (e) {
                    console.warn("[notify] webpush failed", e);
                }
            })
        );
    }
}

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}

async function emailForUser(userId: string): Promise<string> {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    return u?.email ?? "test@example.com";
}