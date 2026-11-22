import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminShippingService } from './admin-shipping.service.js';
import { CreateShipmentDto, CreateShippingMethodDto } from './dto/shipping.dto.js';

@ApiTags('Admin Shipping')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('shipping')
export class AdminShippingController {
  constructor(private readonly shippingService: AdminShippingService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.ORDER_MANAGER, RoleName.MANAGER)
  @Get('methods')
  @ApiOperation({ summary: 'Admin: List all shipping methods' })
  async getMethods() {
    return await this.shippingService.getMethods();
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Post('methods')
  @ApiOperation({ summary: 'Admin: Create shipping method' })
  async createMethod(@Body() dto: CreateShippingMethodDto) {
    return await this.shippingService.createMethod(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.ORDER_MANAGER)
  @Post('shipments')
  @ApiOperation({ summary: 'Admin: Create shipment and tracking details for order' })
  async createShipment(@Body() dto: CreateShipmentDto) {
    return await this.shippingService.createShipment(dto);
  }
}
