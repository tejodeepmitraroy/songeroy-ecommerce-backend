import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../../common/decorators/public.decorator.js';
import { StoreShippingService } from './store-shipping.service.js';

@ApiTags('Store Shipping')
@Controller('shipping')
export class StoreShippingController {
  constructor(private readonly shippingService: StoreShippingService) {}

  @Public()
  @Get('methods')
  @ApiOperation({ summary: 'Store: List available active shipping methods' })
  async getMethods() {
    return await this.shippingService.getMethods();
  }

  @Public()
  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Store: Track shipment by tracking number' })
  async getTracking(@Param('trackingNumber') trackingNumber: string) {
    return await this.shippingService.getTracking(trackingNumber);
  }
}
