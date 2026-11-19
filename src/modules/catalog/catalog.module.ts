import { Module } from '@nestjs/common';

import { BrandsModule } from './brands/brands.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductsModule } from './products/products.module.js';

@Module({
  imports: [ProductsModule, CategoriesModule, BrandsModule],
  exports: [ProductsModule, CategoriesModule, BrandsModule],
})
export class CatalogModule {}
