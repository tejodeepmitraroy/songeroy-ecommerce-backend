import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreCategoriesController } from './store-categories.controller.js';
import { StoreCategoriesService } from './store-categories.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StoreCategoriesController],
  providers: [StoreCategoriesService],
  exports: [StoreCategoriesService],
})
export class StoreCategoriesModule {}
