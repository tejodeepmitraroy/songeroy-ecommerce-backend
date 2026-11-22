import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../../common/decorators/public.decorator.js';
import { StoreBrandsService } from './store-brands.service.js';

@ApiTags('Store Brands')
@Controller('brands')
export class StoreBrandsController {
  constructor(private readonly brandsService: StoreBrandsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Store: List all active brands' })
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Store: Get brand details and products by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.brandsService.findBySlug(slug);
  }
}
