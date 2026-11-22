import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminCustomersService } from './admin-customers.service.js';

@ApiTags('Admin Customers')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('customers')
export class AdminCustomersController {
  constructor(private readonly customersService: AdminCustomersService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.CUSTOMER_SUPPORT, RoleName.MANAGER)
  @Get()
  @ApiOperation({ summary: 'Admin: List registered customers with order counts and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return await this.customersService.findAll(pageNum, limitNum);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.CUSTOMER_SUPPORT, RoleName.MANAGER)
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get customer profile, addresses, and recent orders' })
  async findById(@Param('id') id: string) {
    return await this.customersService.findById(id);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin: Activate or deactivate customer account' })
  async updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return await this.customersService.updateStatus(id, isActive);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Remove customer account' })
  async remove(@Param('id') id: string) {
    return await this.customersService.remove(id);
  }
}
