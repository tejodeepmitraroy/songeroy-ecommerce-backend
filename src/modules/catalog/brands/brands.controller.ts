import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Public } from '../../../common/decorators/public.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { BrandsService } from './brands.service.js';
import type { CreateBrandDto } from './dto/create-brand.dto.js';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active brands' })
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.brandsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Admin: Create brand' })
  async create(@Body() dto: CreateBrandDto) {
    return await this.brandsService.create(dto);
  }
}
