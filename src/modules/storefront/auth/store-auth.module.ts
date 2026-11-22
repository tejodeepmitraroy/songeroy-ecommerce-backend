import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '../../../database/prisma/prisma.module.js';
import { StoreJwtAuthGuard } from './guards/store-jwt-auth.guard.js';
import { StoreAuthController } from './store-auth.controller.js';
import { StoreAuthService } from './store-auth.service.js';
import { StoreJwtStrategy } from './strategies/store-jwt.strategy.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'store-jwt' }),
    JwtModule.register({}),
    PrismaModule,
  ],
  controllers: [StoreAuthController],
  providers: [StoreAuthService, StoreJwtStrategy, StoreJwtAuthGuard],
  exports: [StoreAuthService, StoreJwtAuthGuard, PassportModule, JwtModule],
})
export class StoreAuthModule {}
