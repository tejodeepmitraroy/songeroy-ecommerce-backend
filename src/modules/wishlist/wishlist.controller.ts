import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import { WishlistService } from './wishlist.service.js';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve user wishlist' })
  async getWishlist(@CurrentUser() user: AuthenticatedUser) {
    return await this.wishlistService.getWishlist(user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  async addItem(@CurrentUser() user: AuthenticatedUser, @Param('productId') productId: string) {
    return await this.wishlistService.addItem(user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async removeItem(@CurrentUser() user: AuthenticatedUser, @Param('productId') productId: string) {
    return await this.wishlistService.removeItem(user.id, productId);
  }
}
