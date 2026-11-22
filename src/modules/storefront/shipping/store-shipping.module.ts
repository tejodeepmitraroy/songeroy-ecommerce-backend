import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreShippingController } from './store-shipping.controller.js';
import { StoreShippingService } from './store-shipping.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StoreShippingController],
  providers: [StoreShippingService],
  exports: [StoreShippingService],
})
export class StoreShippingModule {}
