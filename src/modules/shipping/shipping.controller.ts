import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import type { CreateShipmentDto, CreateShippingMethodDto } from './dto/shipping.dto.js';
import { ShippingService } from './shipping.service.js';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Public()
  @Get('methods')
  @ApiOperation({ summary: 'List available shipping methods' })
  async getMethods() {
    return await this.shippingService.getMethods();
  }

  @Public()
  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Track shipment status by tracking number' })
  async getTracking(@Param('trackingNumber') trackingNumber: string) {
    return await this.shippingService.getTracking(trackingNumber);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post('methods')
  @ApiOperation({ summary: 'Admin: Create shipping method' })
  async createMethod(@Body() dto: CreateShippingMethodDto) {
    return await this.shippingService.createMethod(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.ORDER_MANAGER)
  @ApiBearerAuth()
  @Post('shipments')
  @ApiOperation({ summary: 'Admin: Create shipment and tracking' })
  async createShipment(@Body() dto: CreateShipmentDto) {
    return await this.shippingService.createShipment(dto);
  }
}
