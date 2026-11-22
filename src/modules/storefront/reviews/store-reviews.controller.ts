import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { StoreJwtAuthGuard } from '../auth/guards/store-jwt-auth.guard.js';
import { CreateReviewDto } from './dto/review.dto.js';
import { StoreReviewsService } from './store-reviews.service.js';

@ApiTags('Store Reviews')
@Controller('reviews')
export class StoreReviewsController {
  constructor(private readonly reviewsService: StoreReviewsService) {}

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'Store: Get approved reviews for a product' })
  async getProductReviews(@Param('productId') productId: string) {
    return await this.reviewsService.getProductReviews(productId);
  }

  @UseGuards(StoreJwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Store: Submit a product review (subject to moderation)' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewDto) {
    return await this.reviewsService.create(user.id, dto);
  }
}
