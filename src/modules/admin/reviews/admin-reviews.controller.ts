import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminReviewsService } from './admin-reviews.service.js';

@ApiTags('Admin Reviews')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('reviews')
export class AdminReviewsController {
  constructor(private readonly reviewsService: AdminReviewsService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.CUSTOMER_SUPPORT, RoleName.MANAGER)
  @Get()
  @ApiOperation({ summary: 'Admin: List reviews for moderation' })
  @ApiQuery({ name: 'pendingOnly', required: false, type: Boolean })
  async findAll(@Query('pendingOnly') pendingOnly?: string) {
    const isPending = pendingOnly === 'true';
    return await this.reviewsService.findAll(isPending);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.CUSTOMER_SUPPORT)
  @Patch(':id/approval')
  @ApiOperation({ summary: 'Admin: Approve or reject customer review' })
  async approveReview(@Param('id') id: string, @Body('isApproved') isApproved: boolean) {
    return await this.reviewsService.approveReview(id, isApproved);
  }
}
