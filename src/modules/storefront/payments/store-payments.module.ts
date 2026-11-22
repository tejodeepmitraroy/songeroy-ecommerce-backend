import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreAuthModule } from '../auth/store-auth.module.js';
import { StorePaymentsController } from './store-payments.controller.js';
import { StorePaymentsService } from './store-payments.service.js';

@Module({
  imports: [PrismaModule, StoreAuthModule],
  controllers: [StorePaymentsController],
  providers: [StorePaymentsService],
  exports: [StorePaymentsService],
})
export class StorePaymentsModule {}
