import { Module } from '@nestjs/common';

import { AdminAnalyticsModule } from './analytics/admin-analytics.module.js';
import { AdminAuthModule } from './auth/admin-auth.module.js';
import { AdminBrandsModule } from './brands/admin-brands.module.js';
import { AdminCategoriesModule } from './categories/admin-categories.module.js';
import { AdminCouponsModule } from './coupons/admin-coupons.module.js';
import { AdminCustomersModule } from './customers/admin-customers.module.js';
import { AdminEmployeesModule } from './employees/admin-employees.module.js';
import { AdminInventoryModule } from './inventory/admin-inventory.module.js';
import { AdminOrdersModule } from './orders/admin-orders.module.js';
import { AdminProductsModule } from './products/admin-products.module.js';
import { AdminReviewsModule } from './reviews/admin-reviews.module.js';
import { AdminShippingModule } from './shipping/admin-shipping.module.js';

@Module({
  imports: [
    AdminAuthModule,
    AdminProductsModule,
    AdminCategoriesModule,
    AdminBrandsModule,
    AdminOrdersModule,
    AdminInventoryModule,
    AdminCustomersModule,
    AdminEmployeesModule,
    AdminCouponsModule,
    AdminShippingModule,
    AdminReviewsModule,
    AdminAnalyticsModule,
  ],
  exports: [
    AdminAuthModule,
    AdminProductsModule,
    AdminCategoriesModule,
    AdminBrandsModule,
    AdminOrdersModule,
    AdminInventoryModule,
    AdminCustomersModule,
    AdminEmployeesModule,
    AdminCouponsModule,
    AdminShippingModule,
    AdminReviewsModule,
    AdminAnalyticsModule,
  ],
})
export class AdminModule {}
