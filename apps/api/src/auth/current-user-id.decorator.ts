import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUserId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<{ userId?: string }>();
        return req.userId as string | undefined;
    }
);