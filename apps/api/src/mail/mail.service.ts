import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        const host = process.env.SMTP_HOST;
        this.logger.log(`MailService initialized. Host: ${host ? host : 'UNDEFINED'}, Port: ${process.env.SMTP_PORT}`);

        if (host) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT ?? 587),
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }
    }

    async sendEmail(to: string, subject: string, html: string) {
        if (!this.transporter) {
            this.logger.warn(`SMTP not configured. Skipping email to ${to}.`);
            this.logger.warn(`Subject: ${subject}`);
            this.logger.warn(`Content: ${html}`);
            return;
        }

        try {
            const info = await this.transporter.sendMail({
                from: process.env.NOTIFY_FROM_EMAIL ?? '"Finly App" <noreply@finly.app>',
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent: ${info.messageId}`);
        } catch (error) {
            this.logger.error('Error sending email:', error);
            throw error;
        }
    }
}
