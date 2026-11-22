import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminEmployeesController } from '../src/modules/admin/employees/admin-employees.controller.js';
import { AdminEmployeesService } from '../src/modules/admin/employees/admin-employees.service.js';

describe('AdminEmployees Module', () => {
  let service: AdminEmployeesService;
  let controller: AdminEmployeesController;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      role: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      userRole: {
        count: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
    };

    service = new AdminEmployeesService(mockPrisma);
    controller = new AdminEmployeesController(service);
  });

  describe('register', () => {
    it('should successfully register a new employee with staff roles', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockImplementation(({ where }: any) =>
        Promise.resolve({ id: `role-${where.name}`, name: where.name }),
      );

      const fakeCreatedUser = {
        id: 'emp-1',
        email: 'employee@songeroy.com',
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '+919876543210',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: { id: 'role-MANAGER', name: RoleName.MANAGER, description: null } }],
      };

      mockPrisma.user.create.mockResolvedValue(fakeCreatedUser);

      const result = await controller.register({
        email: 'employee@songeroy.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '+919876543210',
        roles: [RoleName.MANAGER],
      });

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.id).toBe('emp-1');
      expect(result.roles).toContain(RoleName.MANAGER);
    });

    it('should throw ConflictException if email is already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'existing-id',
        email: 'taken@songeroy.com',
      });

      await expect(
        service.register({
          email: 'taken@songeroy.com',
          password: 'Password123!',
          roles: [RoleName.MANAGER],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if phone number is already taken', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // email not taken
        .mockResolvedValueOnce({ id: 'existing-id', phoneNumber: '+919999999999' }); // phone taken

      await expect(
        service.register({
          email: 'new@songeroy.com',
          password: 'Password123!',
          phoneNumber: '+919999999999',
          roles: [RoleName.MANAGER],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject invalid/customer role assignments', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.register({
          email: 'test@songeroy.com',
          password: 'Password123!',
          roles: [RoleName.CUSTOMER],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated staff users', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          email: 'admin@songeroy.com',
          firstName: 'Admin',
          lastName: 'User',
          phoneNumber: null,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: [{ role: { id: 'r1', name: RoleName.ADMIN, description: null } }],
        },
      ];

      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findMany.mockResolvedValue(mockEmployees);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].roles).toEqual([RoleName.ADMIN]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return employee details if user is staff', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'emp-1',
        email: 'staff@songeroy.com',
        firstName: 'Staff',
        lastName: 'Member',
        phoneNumber: null,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: { id: 'r2', name: RoleName.MANAGER, description: null } }],
      });

      const result = await controller.findById('emp-1');
      expect(result.id).toBe('emp-1');
      expect(result.roles).toContain(RoleName.MANAGER);
    });

    it('should throw NotFoundException if user is not staff', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-cust',
        email: 'cust@songeroy.com',
        firstName: 'Customer',
        lastName: 'Only',
        phoneNumber: null,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: { id: 'r-c', name: RoleName.CUSTOMER, description: null } }],
      });

      await expect(controller.findById('user-cust')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update employee details and roles', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'emp-1',
        email: 'staff@songeroy.com',
        firstName: 'Old',
        lastName: 'Name',
        phoneNumber: null,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: { id: 'r1', name: RoleName.MANAGER, description: null } }],
      });

      mockPrisma.role.findUnique.mockResolvedValue({ id: 'r-admin', name: RoleName.ADMIN });

      mockPrisma.user.update.mockResolvedValue({
        id: 'emp-1',
        email: 'staff@songeroy.com',
        firstName: 'New',
        lastName: 'Name',
        phoneNumber: null,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: { id: 'r-admin', name: RoleName.ADMIN, description: null } }],
      });

      const result = await controller.update('emp-1', {
        firstName: 'New',
        roles: [RoleName.ADMIN],
      });

      expect(result.firstName).toBe('New');
      expect(result.roles).toContain(RoleName.ADMIN);
      expect(mockPrisma.userRole.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.userRole.createMany).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully remove user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'emp-to-delete',
        email: 'delete@songeroy.com',
        userRoles: [{ role: { name: RoleName.MANAGER } }],
      });
      mockPrisma.user.delete.mockResolvedValue({ id: 'emp-to-delete' });

      const result = await controller.remove('emp-to-delete', {
        id: 'admin-caller',
        email: 'admin@songeroy.com',
        roles: ['ADMIN'],
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe('emp-to-delete');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'emp-to-delete' } });
    });

    it('should prevent self-deletion', async () => {
      await expect(
        controller.remove('admin-caller', {
          id: 'admin-caller',
          email: 'admin@songeroy.com',
          roles: ['ADMIN'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent removing the last SUPER_ADMIN', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'super-admin-1',
        email: 'super@songeroy.com',
        userRoles: [{ role: { name: RoleName.SUPER_ADMIN } }],
      });
      mockPrisma.userRole.count.mockResolvedValue(1);

      await expect(
        controller.remove('super-admin-1', {
          id: 'other-admin',
          email: 'other@songeroy.com',
          roles: ['ADMIN'],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
