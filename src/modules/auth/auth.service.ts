import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import bcrypt from 'bcrypt';

import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import { PrismaService } from '../../database/prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RefreshTokenDto } from './dto/refresh-token.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{
    user: { id: string; email: string; firstName?: string | null };
    accessToken: string;
    refreshToken: string;
  }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    let customerRole = await this.prisma.role.findUnique({
      where: { name: RoleName.CUSTOMER },
    });

    if (!customerRole) {
      customerRole = await this.prisma.role.create({
        data: {
          name: RoleName.CUSTOMER,
          description: 'Standard customer role',
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        userRoles: {
          create: {
            roleId: customerRole.id,
          },
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    const roles = user.userRoles.map((ur) => ur.role.name);
    const tokens = await this.generateTokens(user.id, user.email, roles);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
      },
      ...tokens,
    };
  }

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
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
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
        this.configService.get<string>('jwt.refreshSecret') ||
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'defaultSecretFallbackForDevOnly1234567890';

      const payload = this.jwtService.verify<{ sub: string; email: string }>(dto.refreshToken, {
        secret: refreshSecret,
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
        throw new UnauthorizedException('Invalid refresh token');
      }

      const roles = user.userRoles.map((ur) => ur.role.name);
      return await this.generateTokens(user.id, user.email, roles);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
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
      this.configService.get<string>('jwt.accessSecret') ||
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'defaultSecretFallbackForDevOnly1234567890';

    const accessExpiresIn = this.configService.get<string>('jwt.accessExpiresIn') || '15m';

    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ||
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'defaultSecretFallbackForDevOnly1234567890';

    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as never,
      }),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn as never,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
