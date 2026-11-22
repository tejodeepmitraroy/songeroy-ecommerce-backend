import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreAuthModule } from '../auth/store-auth.module.js';
import { StoreOrdersController } from './store-orders.controller.js';
import { StoreOrdersService } from './store-orders.service.js';

@Module({
  imports: [PrismaModule, StoreAuthModule],
  controllers: [StoreOrdersController],
  providers: [StoreOrdersService],
  exports: [StoreOrdersService],
})
export class StoreOrdersModule {}
