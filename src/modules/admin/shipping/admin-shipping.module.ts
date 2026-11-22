import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { AdminAuthModule } from '../auth/admin-auth.module.js';
import { AdminShippingController } from './admin-shipping.controller.js';
import { AdminShippingService } from './admin-shipping.service.js';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminShippingController],
  providers: [AdminShippingService],
  exports: [AdminShippingService],
})
export class AdminShippingModule {}
