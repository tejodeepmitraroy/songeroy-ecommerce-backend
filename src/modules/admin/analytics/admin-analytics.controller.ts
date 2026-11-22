import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminAnalyticsService } from './admin-analytics.service.js';

@ApiTags('Admin Analytics')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.MANAGER)
  @Get('overview')
  @ApiOperation({ summary: 'Admin: Retrieve high-level revenue and business analytics' })
  async getOverview() {
    return await this.analyticsService.getOverview();
  }
}
