import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminCouponsService } from './admin-coupons.service.js';
import { CreateCouponDto } from './dto/coupon.dto.js';

@ApiTags('Admin Coupons')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('coupons')
export class AdminCouponsController {
  constructor(private readonly couponsService: AdminCouponsService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.MANAGER)
  @Get()
  @ApiOperation({ summary: 'Admin: List all promotional coupons' })
  async findAll() {
    return await this.couponsService.findAll();
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.MANAGER)
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get coupon details and usage statistics' })
  async findById(@Param('id') id: string) {
    return await this.couponsService.findById(id);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Admin: Create a new coupon' })
  async create(@Body() dto: CreateCouponDto) {
    return await this.couponsService.create(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete coupon' })
  async remove(@Param('id') id: string) {
    return await this.couponsService.remove(id);
  }
}
