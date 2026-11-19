import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import { CouponsService } from './coupons.service.js';
import type { CreateCouponDto, ValidateCouponDto } from './dto/coupon.dto.js';

@ApiTags('Coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @ApiBearerAuth()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate coupon code against user and cart total' })
  async validate(@CurrentUser() user: AuthenticatedUser, @Body() dto: ValidateCouponDto) {
    return await this.couponsService.validate(dto, user.id);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Admin: Create coupon' })
  async create(@Body() dto: CreateCouponDto) {
    return await this.couponsService.create(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Admin: List all coupons' })
  async findAll() {
    return await this.couponsService.findAll();
  }
}
