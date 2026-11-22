import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { StoreJwtAuthGuard } from '../auth/guards/store-jwt-auth.guard.js';
import { ValidateCouponDto } from './dto/coupon.dto.js';
import { StoreCouponsService } from './store-coupons.service.js';

@ApiTags('Store Coupons')
@ApiBearerAuth()
@UseGuards(StoreJwtAuthGuard)
@Controller('coupons')
export class StoreCouponsController {
  constructor(private readonly couponsService: StoreCouponsService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Store: Validate coupon code against customer cart total' })
  async validate(@CurrentUser() user: AuthenticatedUser, @Body() dto: ValidateCouponDto) {
    return await this.couponsService.validate(dto, user.id);
  }
}
