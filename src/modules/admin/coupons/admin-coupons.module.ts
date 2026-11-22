import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { AdminAuthModule } from '../auth/admin-auth.module.js';
import { AdminCouponsController } from './admin-coupons.controller.js';
import { AdminCouponsService } from './admin-coupons.service.js';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminCouponsController],
  providers: [AdminCouponsService],
  exports: [AdminCouponsService],
})
export class AdminCouponsModule {}
