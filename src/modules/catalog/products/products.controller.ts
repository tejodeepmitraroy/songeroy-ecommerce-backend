import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Public } from '../../../common/decorators/public.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { QueryProductDto } from './dto/query-product.dto.js';
import { ProductsService } from './products.service.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search and filter products with pagination' })
  async findAll(@Query() query: QueryProductDto) {
    return await this.productsService.findAll(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get product details by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.productsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Admin: Create product with variants' })
  async create(@Body() dto: CreateProductDto) {
    return await this.productsService.create(dto);
  }
}
