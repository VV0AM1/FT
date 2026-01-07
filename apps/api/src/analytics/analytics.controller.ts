import { Controller, Get, Query } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { CurrentUserId } from "../auth/current-user-id.decorator";

@Controller("analytics")
export class AnalyticsController {
  constructor(private service: AnalyticsService) { }

  @Get("dashboard")
  async getDashboardMetrics(
    @CurrentUserId() userId: string,
    @Query("month") month?: string,
    @Query("year") year?: string
  ) {
    return this.service.getDashboardMetrics(
      userId,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined
    );
  }
}