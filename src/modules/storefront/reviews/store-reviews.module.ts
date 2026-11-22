import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreAuthModule } from '../auth/store-auth.module.js';
import { StoreReviewsController } from './store-reviews.controller.js';
import { StoreReviewsService } from './store-reviews.service.js';

@Module({
  imports: [PrismaModule, StoreAuthModule],
  controllers: [StoreReviewsController],
  providers: [StoreReviewsService],
  exports: [StoreReviewsService],
})
export class StoreReviewsModule {}
