import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreAuthModule } from '../auth/store-auth.module.js';
import { StoreCouponsController } from './store-coupons.controller.js';
import { StoreCouponsService } from './store-coupons.service.js';

@Module({
  imports: [PrismaModule, StoreAuthModule],
  controllers: [StoreCouponsController],
  providers: [StoreCouponsService],
  exports: [StoreCouponsService],
})
export class StoreCouponsModule {}
