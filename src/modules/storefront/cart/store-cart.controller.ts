import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { StoreJwtAuthGuard } from '../auth/guards/store-jwt-auth.guard.js';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto.js';
import { StoreCartService } from './store-cart.service.js';

@ApiTags('Store Cart')
@ApiBearerAuth()
@UseGuards(StoreJwtAuthGuard)
@Controller('cart')
export class StoreCartController {
  constructor(private readonly cartService: StoreCartService) {}

  @Get()
  @ApiOperation({ summary: 'Store: Retrieve authenticated customer cart' })
  async getCart(@CurrentUser() user: AuthenticatedUser) {
    return await this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Store: Add product variant to cart' })
  async addItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddToCartDto) {
    return await this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Store: Update cart item quantity' })
  async updateQuantity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateItemQuantity(user.id, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Store: Remove item from cart' })
  async removeItem(@CurrentUser() user: AuthenticatedUser, @Param('itemId') itemId: string) {
    return await this.cartService.removeItem(user.id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Store: Clear entire cart' })
  async clearCart(@CurrentUser() user: AuthenticatedUser) {
    return await this.cartService.clearCart(user.id);
  }
}
