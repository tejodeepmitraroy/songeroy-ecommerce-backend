import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreBrandsController } from './store-brands.controller.js';
import { StoreBrandsService } from './store-brands.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StoreBrandsController],
  providers: [StoreBrandsService],
  exports: [StoreBrandsService],
})
export class StoreBrandsModule {}
