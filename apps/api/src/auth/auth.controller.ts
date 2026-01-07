import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('otp/send')
    async sendOtp(@Body('email') email: string) {
        return this.authService.generateOtp(email);
    }

    @Post('otp/verify')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() body: { email: string; token: string }) {
        const user = await this.authService.verifyOtp(body.email, body.token);
        // In a full implementation, we'd return a JWT here. 
        // For NextAuth "Credentials" provider, just returning the user object is enough
        // because NextAuth will wrap it in a session.
        return user;
    }
}
