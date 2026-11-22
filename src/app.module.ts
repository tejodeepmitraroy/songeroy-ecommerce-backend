import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';

import configuration from './config/configuration.js';
import { envValidationSchema } from './config/env.validation.js';
import { PrismaModule } from './database/prisma/prisma.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AdminAnalyticsModule } from './modules/admin/analytics/admin-analytics.module.js';
import { AdminAuthModule } from './modules/admin/auth/admin-auth.module.js';
import { AdminBrandsModule } from './modules/admin/brands/admin-brands.module.js';
import { AdminCategoriesModule } from './modules/admin/categories/admin-categories.module.js';
import { AdminCouponsModule } from './modules/admin/coupons/admin-coupons.module.js';
import { AdminCustomersModule } from './modules/admin/customers/admin-customers.module.js';
import { AdminEmployeesModule } from './modules/admin/employees/admin-employees.module.js';
import { AdminInventoryModule } from './modules/admin/inventory/admin-inventory.module.js';
import { AdminOrdersModule } from './modules/admin/orders/admin-orders.module.js';
import { AdminProductsModule } from './modules/admin/products/admin-products.module.js';
import { AdminReviewsModule } from './modules/admin/reviews/admin-reviews.module.js';
import { AdminShippingModule } from './modules/admin/shipping/admin-shipping.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { StoreAuthModule } from './modules/storefront/auth/store-auth.module.js';
import { StoreBrandsModule } from './modules/storefront/brands/store-brands.module.js';
import { StoreCartModule } from './modules/storefront/cart/store-cart.module.js';
import { StoreCategoriesModule } from './modules/storefront/categories/store-categories.module.js';
import { StoreCouponsModule } from './modules/storefront/coupons/store-coupons.module.js';
import { StoreOrdersModule } from './modules/storefront/orders/store-orders.module.js';
import { StorePaymentsModule } from './modules/storefront/payments/store-payments.module.js';
import { StoreProductsModule } from './modules/storefront/products/store-products.module.js';
import { StoreProfileModule } from './modules/storefront/profile/store-profile.module.js';
import { StoreReviewsModule } from './modules/storefront/reviews/store-reviews.module.js';
import { StoreShippingModule } from './modules/storefront/shipping/store-shipping.module.js';
import { StorefrontModule } from './modules/storefront/storefront.module.js';
import { StoreWishlistModule } from './modules/storefront/wishlist/store-wishlist.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    HealthModule,
    AdminModule,
    StorefrontModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
        children: [
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
      },
      {
        path: 'store',
        module: StorefrontModule,
        children: [
          StoreAuthModule,
          StoreProductsModule,
          StoreCategoriesModule,
          StoreBrandsModule,
          StoreCartModule,
          StoreWishlistModule,
          StoreOrdersModule,
          StorePaymentsModule,
          StoreCouponsModule,
          StoreShippingModule,
          StoreReviewsModule,
          StoreProfileModule,
        ],
      },
    ]),
  ],
})
export class AppModule {}
