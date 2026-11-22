import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { StoreJwtAuthGuard } from '../auth/guards/store-jwt-auth.guard.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { StoreOrdersService } from './store-orders.service.js';

@ApiTags('Store Orders')
@ApiBearerAuth()
@UseGuards(StoreJwtAuthGuard)
@Controller('orders')
export class StoreOrdersController {
  constructor(private readonly ordersService: StoreOrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Store: Checkout cart and place order' })
  async checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return await this.ordersService.createOrder(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Store: View own order history' })
  async getMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return await this.ordersService.getCustomerOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Store: Get customer order details by order ID' })
  async getOrder(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return await this.ordersService.getOrderById(id, user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Store: Cancel a pending order' })
  async cancelOrder(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return await this.ordersService.cancelOrder(id, user.id);
  }
}
