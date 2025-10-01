import { Injectable, NestMiddleware } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class BootstrapUserMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) { }

    async use(req: Request, _res: Response, next: NextFunction) {
        const email = req.header("x-user-email");
        const r = req as Request & { userEmail?: string; userId?: string };

        if (email) {
            const user = await this.prisma.user.upsert({
                where: { email },
                update: {},
                create: { email },
                select: { id: true, email: true },
            });
            r.userEmail = user.email;
            r.userId = user.id;
        }
        next();
    }
}