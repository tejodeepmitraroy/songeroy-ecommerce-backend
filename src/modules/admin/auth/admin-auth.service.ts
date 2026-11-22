import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';

import { STAFF_ROLES } from '../../../common/constants/roles.constant.js';
import { passwordCompare } from '../../../common/helper/passwordHasher.helper.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RefreshTokenDto } from './dto/refresh-token.dto.js';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{
    user: { id: string; email: string; roles: string[] };
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid administrative email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Admin account is inactive');
    }

    const roles = user.userRoles.map((ur) => ur.role.name as RoleName);
    const hasStaffRole = roles.some((r) => STAFF_ROLES.includes(r));

    if (!hasStaffRole) {
      throw new UnauthorizedException('Access denied: Staff privileges required');
    }

    const isMatch = await passwordCompare({
      password: dto.password,
      hashedPassword: user.passwordHash,
    });
    if (!isMatch) {
      throw new UnauthorizedException('Invalid administrative email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, roles);

    return {
      user: {
        id: user.id,
        email: user.email,
        roles,
      },
      ...tokens,
    };
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const refreshSecret =
        this.configService.get<string>('jwt.admin.refreshSecret') ||
        this.configService.get<string>('ADMIN_JWT_REFRESH_SECRET') ||
        this.configService.get<string>('jwt.refreshSecret') ||
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'defaultSecretFallbackForDevOnly1234567890';

      const audience = this.configService.get<string>('jwt.admin.audience') || 'admin-api';

      const payload = this.jwtService.verify<{ sub: string; email: string }>(dto.refreshToken, {
        secret: refreshSecret,
        audience,
      });

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
        throw new UnauthorizedException('Invalid administrative refresh token');
      }

      const roles = user.userRoles.map((ur) => ur.role.name as RoleName);
      const hasStaffRole = roles.some((r) => STAFF_ROLES.includes(r));

      if (!hasStaffRole) {
        throw new UnauthorizedException('Access denied: Staff privileges required');
      }

      return await this.generateTokens(user.id, user.email, roles);
    } catch {
      throw new UnauthorizedException('Invalid or expired administrative refresh token');
    }
  }

  async logout(user: AuthenticatedUser): Promise<{ message: string }> {
    if (!user || !user.id) {
      throw new BadRequestException('User identification missing');
    }
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, isRevoked: false },
      data: { isRevoked: true },
    });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    userId: string,
    email: string,
    roles: string[],
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email, roles };

    const accessSecret =
      this.configService.get<string>('jwt.admin.accessSecret') ||
      this.configService.get<string>('ADMIN_JWT_ACCESS_SECRET') ||
      this.configService.get<string>('jwt.accessSecret') ||
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'defaultSecretFallbackForDevOnly1234567890';

    const accessExpiresIn =
      this.configService.get<string>('jwt.admin.accessExpiresIn') ||
      this.configService.get<string>('jwt.accessExpiresIn') ||
      '15m';

    const refreshSecret =
      this.configService.get<string>('jwt.admin.refreshSecret') ||
      this.configService.get<string>('ADMIN_JWT_REFRESH_SECRET') ||
      this.configService.get<string>('jwt.refreshSecret') ||
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'defaultSecretFallbackForDevOnly1234567890';

    const refreshExpiresIn =
      this.configService.get<string>('jwt.admin.refreshExpiresIn') ||
      this.configService.get<string>('jwt.refreshExpiresIn') ||
      '7d';

    const audience = this.configService.get<string>('jwt.admin.audience') || 'admin-api';
    const issuer = this.configService.get<string>('jwt.admin.issuer') || 'songeroy-backend';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as never,
        audience,
        issuer,
      }),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn as never,
          audience,
          issuer,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
