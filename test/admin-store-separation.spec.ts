import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleName } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

import { AdminJwtStrategy } from '../src/modules/admin/auth/strategies/admin-jwt.strategy.js';
import { StoreJwtStrategy } from '../src/modules/storefront/auth/strategies/store-jwt.strategy.js';

describe('Admin and Storefront Separation', () => {
  const mockConfigService = {
    get: vi.fn((key: string) => {
      if (key.includes('Secret')) return 'test-jwt-secret-with-minimum-32-characters-length!';
      if (key === 'jwt.admin.audience') return 'admin-api';
      if (key === 'jwt.store.audience') return 'store-api';
      return null;
    }),
  } as unknown as ConfigService;

  describe('AdminJwtStrategy', () => {
    it('should reject a customer trying to authenticate against admin', async () => {
      const mockPrisma = {
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'user-customer-id',
            email: 'customer@example.com',
            isActive: true,
            userRoles: [{ role: { name: RoleName.CUSTOMER } }],
          }),
        },
      };

      const strategy = new AdminJwtStrategy(mockConfigService, mockPrisma as never);

      await expect(
        strategy.validate({
          sub: 'user-customer-id',
          email: 'customer@example.com',
          roles: ['CUSTOMER'],
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should allow a staff user (ADMIN) to authenticate against admin', async () => {
      const mockPrisma = {
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'admin-id',
            email: 'admin@songeroy.com',
            isActive: true,
            userRoles: [{ role: { name: RoleName.ADMIN } }],
          }),
        },
      };

      const strategy = new AdminJwtStrategy(mockConfigService, mockPrisma as never);
      const user = await strategy.validate({
        sub: 'admin-id',
        email: 'admin@songeroy.com',
        roles: ['ADMIN'],
      });

      expect(user.id).toBe('admin-id');
      expect(user.roles).toContain(RoleName.ADMIN);
    });

    it('should reject inactive admin accounts', async () => {
      const mockPrisma = {
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'inactive-admin-id',
            email: 'admin@songeroy.com',
            isActive: false,
            userRoles: [{ role: { name: RoleName.ADMIN } }],
          }),
        },
      };

      const strategy = new AdminJwtStrategy(mockConfigService, mockPrisma as never);

      await expect(
        strategy.validate({
          sub: 'inactive-admin-id',
          email: 'admin@songeroy.com',
          roles: ['ADMIN'],
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('StoreJwtStrategy', () => {
    it('should allow active customers to authenticate against store', async () => {
      const mockPrisma = {
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'customer-id',
            email: 'customer@example.com',
            isActive: true,
            userRoles: [{ role: { name: RoleName.CUSTOMER } }],
          }),
        },
      };

      const strategy = new StoreJwtStrategy(mockConfigService, mockPrisma as never);
      const user = await strategy.validate({
        sub: 'customer-id',
        email: 'customer@example.com',
        roles: ['CUSTOMER'],
      });

      expect(user.id).toBe('customer-id');
      expect(user.roles).toContain(RoleName.CUSTOMER);
    });

    it('should reject inactive customer accounts', async () => {
      const mockPrisma = {
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'inactive-customer-id',
            email: 'customer@example.com',
            isActive: false,
            userRoles: [{ role: { name: RoleName.CUSTOMER } }],
          }),
        },
      };

      const strategy = new StoreJwtStrategy(mockConfigService, mockPrisma as never);

      await expect(
        strategy.validate({
          sub: 'inactive-customer-id',
          email: 'customer@example.com',
          roles: ['CUSTOMER'],
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
