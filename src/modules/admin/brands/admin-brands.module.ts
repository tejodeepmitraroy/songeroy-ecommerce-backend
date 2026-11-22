import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { AdminAuthModule } from '../auth/admin-auth.module.js';
import { AdminBrandsController } from './admin-brands.controller.js';
import { AdminBrandsService } from './admin-brands.service.js';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminBrandsController],
  providers: [AdminBrandsService],
  exports: [AdminBrandsService],
})
export class AdminBrandsModule {}
