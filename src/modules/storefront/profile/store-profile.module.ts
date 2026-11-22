import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreAuthModule } from '../auth/store-auth.module.js';
import { StoreProfileController } from './store-profile.controller.js';
import { StoreProfileService } from './store-profile.service.js';

@Module({
  imports: [PrismaModule, StoreAuthModule],
  controllers: [StoreProfileController],
  providers: [StoreProfileService],
  exports: [StoreProfileService],
})
export class StoreProfileModule {}
