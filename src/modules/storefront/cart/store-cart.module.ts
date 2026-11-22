import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreAuthModule } from '../auth/store-auth.module.js';
import { StoreCartController } from './store-cart.controller.js';
import { StoreCartService } from './store-cart.service.js';

@Module({
  imports: [PrismaModule, StoreAuthModule],
  controllers: [StoreCartController],
  providers: [StoreCartService],
  exports: [StoreCartService],
})
export class StoreCartModule {}
