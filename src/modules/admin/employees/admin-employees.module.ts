import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { AdminAuthModule } from '../auth/admin-auth.module.js';
import { AdminEmployeesController } from './admin-employees.controller.js';
import { AdminEmployeesService } from './admin-employees.service.js';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminEmployeesController],
  providers: [AdminEmployeesService],
  exports: [AdminEmployeesService],
})
export class AdminEmployeesModule {}
