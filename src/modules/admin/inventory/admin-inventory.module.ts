import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { AdminAuthModule } from '../auth/admin-auth.module.js';
import { AdminInventoryController } from './admin-inventory.controller.js';
import { AdminInventoryService } from './admin-inventory.service.js';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminInventoryController],
  providers: [AdminInventoryService],
  exports: [AdminInventoryService],
})
export class AdminInventoryModule {}
