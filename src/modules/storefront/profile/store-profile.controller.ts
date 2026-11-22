import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { StoreJwtAuthGuard } from '../auth/guards/store-jwt-auth.guard.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { StoreProfileService } from './store-profile.service.js';

@ApiTags('Store Profile')
@ApiBearerAuth()
@UseGuards(StoreJwtAuthGuard)
@Controller('profile')
export class StoreProfileController {
  constructor(private readonly profileService: StoreProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Store: Get customer profile and saved addresses' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return await this.profileService.getProfile(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Store: Update customer profile details' })
  async updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateUserDto) {
    return await this.profileService.updateProfile(user.id, dto);
  }
}
