import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminProductsService } from './admin-products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';

@ApiTags('Admin Products')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('products')
export class AdminProductsController {
  constructor(private readonly productsService: AdminProductsService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER, RoleName.MANAGER)
  @Get()
  @ApiOperation({ summary: 'Admin: Search and filter products including inventory breakdowns' })
  async findAll(@Query() query: QueryProductDto) {
    return await this.productsService.findAll(query);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER, RoleName.MANAGER)
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get product details by ID' })
  async findById(@Param('id') id: string) {
    return await this.productsService.findById(id);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Post()
  @ApiOperation({ summary: 'Admin: Create product with variants' })
  async create(@Body() dto: CreateProductDto) {
    return await this.productsService.create(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update product details' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return await this.productsService.update(id, dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete product' })
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
