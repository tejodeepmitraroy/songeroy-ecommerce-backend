import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { StoreJwtAuthGuard } from '../auth/guards/store-jwt-auth.guard.js';
import { StoreWishlistService } from './store-wishlist.service.js';

@ApiTags('Store Wishlist')
@ApiBearerAuth()
@UseGuards(StoreJwtAuthGuard)
@Controller('wishlist')
export class StoreWishlistController {
  constructor(private readonly wishlistService: StoreWishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Store: Retrieve customer wishlist' })
  async getWishlist(@CurrentUser() user: AuthenticatedUser) {
    return await this.wishlistService.getWishlist(user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Store: Add product to wishlist' })
  async addItem(@CurrentUser() user: AuthenticatedUser, @Param('productId') productId: string) {
    return await this.wishlistService.addItem(user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Store: Remove product from wishlist' })
  async removeItem(@CurrentUser() user: AuthenticatedUser, @Param('productId') productId: string) {
    return await this.wishlistService.removeItem(user.id, productId);
  }
}
