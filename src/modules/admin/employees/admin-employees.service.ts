import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleName } from '@prisma/client';

import { STAFF_ROLES } from '../../../common/constants/roles.constant.js';
import { passwordHasher } from '../../../common/helper/passwordHasher.helper.js';
import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { QueryEmployeeDto } from './dto/query-employee.dto.js';
import type { RegisterEmployeeDto } from './dto/register-employee.dto.js';
import type { UpdateEmployeeDto } from './dto/update-employee.dto.js';

const EMPLOYEE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  isActive: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    select: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminEmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterEmployeeDto) {
    const email = dto.email.toLowerCase();

    const existingEmail = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('A user with this email already exists');
    }

    if (dto.phoneNumber) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (existingPhone) {
        throw new ConflictException('A user with this phone number already exists');
      }
    }

    this.validateStaffRoles(dto.roles);

    const passwordHash = await passwordHasher(dto.password);

    const roleEntities = await this.ensureRolesExist(dto.roles);

    const employee = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        isEmailVerified: true,
        isActive: true,
        userRoles: {
          create: roleEntities.map((role) => ({
            roleId: role.id,
          })),
        },
      },
      select: EMPLOYEE_SELECT,
    });

    return this.formatEmployee(employee);
  }

  async findAll(query: QueryEmployeeDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      userRoles: {
        some: {
          role: {
            name: query.role ? query.role : { in: STAFF_ROLES },
          },
        },
      },
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: EMPLOYEE_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: users.map((u) => this.formatEmployee(u)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: EMPLOYEE_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }

    const isStaff = user.userRoles.some((ur) => STAFF_ROLES.includes(ur.role.name as RoleName));
    if (!isStaff) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }

    return this.formatEmployee(user);
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findById(id);

    if (dto.phoneNumber) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (existingPhone && existingPhone.id !== id) {
        throw new ConflictException('A user with this phone number already exists');
      }
    }

    if (dto.roles && dto.roles.length > 0) {
      this.validateStaffRoles(dto.roles);
      const roleEntities = await this.ensureRolesExist(dto.roles);

      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });

      await this.prisma.userRole.createMany({
        data: roleEntities.map((role) => ({
          userId: id,
          roleId: role.id,
        })),
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        isActive: dto.isActive,
      },
      select: EMPLOYEE_SELECT,
    });

    return this.formatEmployee(updatedUser);
  }

  async remove(id: string, currentUserId?: string) {
    if (currentUserId && currentUserId === id) {
      throw new BadRequestException('You cannot remove your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === RoleName.SUPER_ADMIN);
    if (isSuperAdmin) {
      const superAdminCount = await this.prisma.userRole.count({
        where: {
          role: { name: RoleName.SUPER_ADMIN },
        },
      });
      if (superAdminCount <= 1) {
        throw new BadRequestException('Cannot remove the last remaining SUPER_ADMIN user');
      }
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'User successfully removed',
      id,
    };
  }

  private validateStaffRoles(roles: RoleName[]) {
    for (const role of roles) {
      if (!STAFF_ROLES.includes(role)) {
        throw new BadRequestException(
          `Invalid staff role "${role}". Only employee roles (${STAFF_ROLES.join(', ')}) can be assigned.`,
        );
      }
    }
  }

  private async ensureRolesExist(roles: RoleName[]) {
    return await Promise.all(
      roles.map(async (name) => {
        let role = await this.prisma.role.findUnique({
          where: { name },
        });

        if (!role) {
          role = await this.prisma.role.create({
            data: {
              name,
              description: `Staff role: ${name}`,
            },
          });
        }

        return role;
      }),
    );
  }

  private formatEmployee(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    userRoles: {
      role: {
        id: string;
        name: RoleName;
        description: string | null;
      };
    }[];
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }
}
