import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import { CartService } from './cart.service.js';
import type { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto.js';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve customer cart with server-side totals' })
  async getCart(@CurrentUser() user: AuthenticatedUser) {
    return await this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add product variant to cart' })
  async addItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddToCartDto) {
    return await this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateQuantity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateItemQuantity(user.id, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@CurrentUser() user: AuthenticatedUser, @Param('itemId') itemId: string) {
    return await this.cartService.removeItem(user.id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from cart' })
  async clearCart(@CurrentUser() user: AuthenticatedUser) {
    return await this.cartService.clearCart(user.id);
  }
}
