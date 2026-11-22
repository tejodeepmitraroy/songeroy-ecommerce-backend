import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreAuthModule } from '../auth/store-auth.module.js';
import { StoreWishlistController } from './store-wishlist.controller.js';
import { StoreWishlistService } from './store-wishlist.service.js';

@Module({
  imports: [PrismaModule, StoreAuthModule],
  controllers: [StoreWishlistController],
  providers: [StoreWishlistService],
  exports: [StoreWishlistService],
})
export class StoreWishlistModule {}
