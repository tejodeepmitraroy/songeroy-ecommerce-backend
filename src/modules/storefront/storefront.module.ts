import { Module } from '@nestjs/common';

import { StoreAuthModule } from './auth/store-auth.module.js';
import { StoreBrandsModule } from './brands/store-brands.module.js';
import { StoreCartModule } from './cart/store-cart.module.js';
import { StoreCategoriesModule } from './categories/store-categories.module.js';
import { StoreCouponsModule } from './coupons/store-coupons.module.js';
import { StoreOrdersModule } from './orders/store-orders.module.js';
import { StorePaymentsModule } from './payments/store-payments.module.js';
import { StoreProductsModule } from './products/store-products.module.js';
import { StoreProfileModule } from './profile/store-profile.module.js';
import { StoreReviewsModule } from './reviews/store-reviews.module.js';
import { StoreShippingModule } from './shipping/store-shipping.module.js';
import { StoreWishlistModule } from './wishlist/store-wishlist.module.js';

@Module({
  imports: [
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
  exports: [
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
})
export class StorefrontModule {}
