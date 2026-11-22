import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminBrandsService } from './admin-brands.service.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';

@ApiTags('Admin Brands')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('brands')
export class AdminBrandsController {
  constructor(private readonly brandsService: AdminBrandsService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER, RoleName.MANAGER)
  @Get()
  @ApiOperation({ summary: 'Admin: List all brands with product counts' })
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER, RoleName.MANAGER)
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get brand by ID' })
  async findById(@Param('id') id: string) {
    return await this.brandsService.findById(id);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Admin: Create brand' })
  async create(@Body() dto: CreateBrandDto) {
    return await this.brandsService.create(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update brand' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateBrandDto>) {
    return await this.brandsService.update(id, dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete brand' })
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
