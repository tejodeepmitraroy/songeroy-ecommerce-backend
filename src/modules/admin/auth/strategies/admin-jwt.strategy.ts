import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { RoleName } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type {
  AuthenticatedUser,
  JwtPayload,
} from '../../../../common/interfaces/jwt-payload.interface.js';
import { PrismaService } from '../../../../database/prisma/prisma.service.js';

const STAFF_ROLES: RoleName[] = [
  RoleName.ADMIN,
  RoleName.SUPER_ADMIN,
  RoleName.MANAGER,
  RoleName.INVENTORY_MANAGER,
  RoleName.ORDER_MANAGER,
  RoleName.CUSTOMER_SUPPORT,
];

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const adminSecret =
      configService.get<string>('jwt.admin.accessSecret') ||
      configService.get<string>('ADMIN_JWT_ACCESS_SECRET') ||
      configService.get<string>('jwt.accessSecret') ||
      configService.get<string>('JWT_ACCESS_SECRET') ||
      'defaultSecretFallbackForDevOnly1234567890';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: adminSecret,
      audience: configService.get<string>('jwt.admin.audience') || 'admin-api',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Admin account is inactive or not found');
    }

    const roles = user.userRoles.map((ur) => ur.role.name as RoleName);
    const hasStaffRole = roles.some((r) => STAFF_ROLES.includes(r));

    if (!hasStaffRole) {
      throw new UnauthorizedException('Admin access required');
    }

    return {
      id: user.id,
      email: user.email,
      roles,
    };
  }
}
