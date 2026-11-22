import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { StoreJwtAuthGuard } from './guards/store-jwt-auth.guard.js';
import { StoreAuthService } from './store-auth.service.js';

@ApiTags('Store Auth')
@Controller('auth')
export class StoreAuthController {
  constructor(private readonly storeAuthService: StoreAuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Store: Customer registration' })
  async register(@Body() dto: RegisterDto) {
    return await this.storeAuthService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Store: Customer login' })
  async login(@Body() dto: LoginDto) {
    return await this.storeAuthService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Store: Refresh customer access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return await this.storeAuthService.refreshTokens(dto);
  }

  @UseGuards(StoreJwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Store: Customer logout' })
  async logout(@CurrentUser() user: AuthenticatedUser) {
    return await this.storeAuthService.logout(user);
  }

  @UseGuards(StoreJwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Store: Retrieve currently logged-in customer profile' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
