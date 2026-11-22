import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type {
  AuthenticatedUser,
  JwtPayload,
} from '../../../../common/interfaces/jwt-payload.interface.js';
import { PrismaService } from '../../../../database/prisma/prisma.service.js';

@Injectable()
export class StoreJwtStrategy extends PassportStrategy(Strategy, 'store-jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const storeSecret =
      configService.get<string>('jwt.store.accessSecret') ||
      configService.get<string>('STORE_JWT_ACCESS_SECRET') ||
      configService.get<string>('jwt.accessSecret') ||
      configService.get<string>('JWT_ACCESS_SECRET') ||
      'defaultSecretFallbackForDevOnly1234567890';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: storeSecret,
      audience: configService.get<string>('jwt.store.audience') || 'store-api',
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
      throw new UnauthorizedException('Customer account is inactive or not found');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }
}
