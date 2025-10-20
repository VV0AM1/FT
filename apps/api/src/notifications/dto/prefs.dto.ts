import { IsBoolean, IsOptional } from "class-validator";

export class UpdatePrefsDto {
    @IsOptional() @IsBoolean() budgetAlertsEnabled?: boolean;
    @IsOptional() @IsBoolean() threshold80Enabled?: boolean;
    @IsOptional() @IsBoolean() threshold100Enabled?: boolean;
    @IsOptional() @IsBoolean() emailEnabled?: boolean;
    @IsOptional() @IsBoolean() webPushEnabled?: boolean;
}

export class SaveSubscriptionDto {
    endpoint: string;
    p256dh: string;
    auth: string;
}