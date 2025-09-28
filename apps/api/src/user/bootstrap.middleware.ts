import { Injectable, NestMiddleware } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class BootstrapUserMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) { }
    async use(req: Request, _res: Response, next: NextFunction) {
        const email = req.header("x-user-email");
        if (email) {
            await this.prisma.user.upsert({
                where: { email },
                update: {},
                create: { email },
            });
            (req as any).userEmail = email;
        }
        next();
    }
}