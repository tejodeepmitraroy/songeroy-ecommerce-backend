import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrderStatus, RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminOrdersService } from './admin-orders.service.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

@ApiTags('Admin Orders')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.ORDER_MANAGER, RoleName.MANAGER)
  @Get()
  @ApiOperation({ summary: 'Admin: List all orders with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  async listOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return await this.ordersService.listAll(pageNum, limitNum, status);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.ORDER_MANAGER, RoleName.MANAGER)
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get complete order details by order ID' })
  async getOrder(@Param('id') id: string) {
    return await this.ordersService.findById(id);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.ORDER_MANAGER)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin: Transition order status following strict state machine' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return await this.ordersService.updateStatus(id, dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.ORDER_MANAGER)
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Admin: Cancel an order' })
  async cancelOrder(@Param('id') id: string, @Body('reason') reason?: string) {
    return await this.ordersService.cancelOrder(id, reason);
  }
}
