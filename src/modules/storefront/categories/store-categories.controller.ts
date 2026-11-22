import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../../common/decorators/public.decorator.js';
import { StoreCategoriesService } from './store-categories.service.js';

@ApiTags('Store Categories')
@Controller('categories')
export class StoreCategoriesController {
  constructor(private readonly categoriesService: StoreCategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Store: List all active product categories' })
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Store: Get category details and products by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.categoriesService.findBySlug(slug);
  }
}
