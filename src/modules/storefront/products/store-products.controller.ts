import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../../common/decorators/public.decorator.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { StoreProductsService } from './store-products.service.js';

@ApiTags('Store Products')
@Controller('products')
export class StoreProductsController {
  constructor(private readonly productsService: StoreProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Store: Search, filter, and paginate active products' })
  async findAll(@Query() query: QueryProductDto) {
    return await this.productsService.findAll(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Store: Get product details by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.productsService.findBySlug(slug);
  }
}
