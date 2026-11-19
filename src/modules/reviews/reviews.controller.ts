import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import type { CreateReviewDto } from './dto/review.dto.js';
import { ReviewsService } from './reviews.service.js';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get approved reviews for a product' })
  async getProductReviews(@Param('productId') productId: string) {
    return await this.reviewsService.getProductReviews(productId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Customer: Submit a review for a product' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewDto) {
    return await this.reviewsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiBearerAuth()
  @Patch(':id/approval')
  @ApiOperation({ summary: 'Admin: Moderate/approve review' })
  async approveReview(@Param('id') id: string, @Body('isApproved') isApproved: boolean) {
    return await this.reviewsService.approveReview(id, isApproved);
  }
}
