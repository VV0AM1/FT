import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async generateOtp(email: string) {
        const token = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete existing OTPs for this email
        await this.prisma.otp.deleteMany({ where: { email } });

        // Save new OTP
        await this.prisma.otp.create({
            data: {
                email,
                token,
                expiresAt,
            },
        });

        // Send Email
        await this.mailService.sendEmail(
            email,
            'Your Login Code',
            `<p>Your login code is: <strong>${token}</strong></p><p>It expires in 10 minutes.</p>`
        );

        return { message: 'OTP sent' };
    }

    async verifyOtp(email: string, token: string) {
        const otp = await this.prisma.otp.findUnique({
            where: { email },
        });

        if (!otp || otp.token !== token) {
            throw new UnauthorizedException('Invalid OTP');
        }

        if (otp.expiresAt < new Date()) {
            throw new UnauthorizedException('OTP Expired');
        }

        // OTP is valid, delete it
        await this.prisma.otp.delete({ where: { id: otp.id } });

        // Find or Create User
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                },
            });
        }

        return user;
    }
}
