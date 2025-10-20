import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdatePrefsDto, SaveSubscriptionDto } from "./dto/prefs.dto";
import { CurrentUserId } from "../auth/current-user-id.decorator";

@Controller("notifications")
export class NotificationsController {
  constructor(private prisma: PrismaService) { }

  @Get("prefs")
  async getPrefs(@CurrentUserId() userId: string) {
    return this.prisma.notificationPref.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  @Patch("prefs")
  async updatePrefs(@CurrentUserId() userId: string, @Body() dto: UpdatePrefsDto) {
    return this.prisma.notificationPref.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  @Post("webpush/subscribe")
  async saveSub(@CurrentUserId() userId: string, @Body() dto: SaveSubscriptionDto) {
    await this.prisma.webPushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint: dto.endpoint } },
      update: { p256dh: dto.p256dh, auth: dto.auth },
      create: { userId, endpoint: dto.endpoint, p256dh: dto.p256dh, auth: dto.auth },
    });
    await this.prisma.notificationPref.upsert({
      where: { userId },
      update: { webPushEnabled: true },
      create: { userId, webPushEnabled: true },
    });
    return { ok: true };
  }
}