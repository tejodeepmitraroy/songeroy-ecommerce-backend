import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreProductsController } from './store-products.controller.js';
import { StoreProductsService } from './store-products.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StoreProductsController],
  providers: [StoreProductsService],
  exports: [StoreProductsService],
})
export class StoreProductsModule {}
