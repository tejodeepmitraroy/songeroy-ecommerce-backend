import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminCategoriesService } from './admin-categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@ApiTags('Admin Categories')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER, RoleName.MANAGER)
  @Get()
  @ApiOperation({ summary: 'Admin: List all categories with product counts' })
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER, RoleName.MANAGER)
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get category by ID' })
  async findById(@Param('id') id: string) {
    return await this.categoriesService.findById(id);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Admin: Create category' })
  async create(@Body() dto: CreateCategoryDto) {
    return await this.categoriesService.create(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update category' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateCategoryDto>) {
    return await this.categoriesService.update(id, dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete category' })
  async remove(@Param('id') id: string) {
    return await this.categoriesService.remove(id);
  }
}
