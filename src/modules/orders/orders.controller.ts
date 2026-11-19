import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrderStatus, RoleName } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Customer: Checkout cart and place order' })
  async checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return await this.ordersService.createOrder(user.id, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Customer: View own order history' })
  async getMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return await this.ordersService.getCustomerOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by order ID' })
  async getOrder(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return await this.ordersService.getOrderById(id, user);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.ORDER_MANAGER)
  @Get('admin/all')
  @ApiOperation({ summary: 'Admin: List all orders with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  async listOrdersAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return await this.ordersService.listOrdersAdmin(pageNum, limitNum, status);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.ORDER_MANAGER)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin: Update order state with transition validation' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return await this.ordersService.updateOrderStatus(id, dto);
  }
}
