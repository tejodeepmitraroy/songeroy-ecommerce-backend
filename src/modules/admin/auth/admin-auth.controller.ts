import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { AdminAuthService } from './admin-auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard.js';
import { ConfigService } from '@nestjs/config';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

@ApiTags('Admin Auth')
@Controller('auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService,
    private readonly configService:ConfigService
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin / Staff login with admin-api audience token' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const returnData = await this.adminAuthService.login(dto);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', returnData.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      expires: new Date(Date.now() + ACCESS_TOKEN_MAX_AGE),
      path: '/',
    });

    res.cookie('refreshToken', returnData.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      expires: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
      path: '/',
    });

    return returnData;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh administrative access token' })
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const returnData = await this.adminAuthService.refreshTokens(dto);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', returnData.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      expires: new Date(Date.now() + ACCESS_TOKEN_MAX_AGE),
      path: '/',
    });

    res.cookie('refreshToken', returnData.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      expires: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
      path: '/',
    });

    return returnData;
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff logout and token revocation' })
  async logout(@CurrentUser() user: AuthenticatedUser, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return await this.adminAuthService.logout(user);
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Retrieve currently logged in staff profile and permissions' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
