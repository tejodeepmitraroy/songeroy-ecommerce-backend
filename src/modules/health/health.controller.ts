import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator.js';
import { HealthService } from './health.service.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'General application health check' })
  check() {
    return this.healthService.checkApp();
  }

  @Public()
  @Get('database')
  @ApiOperation({ summary: 'Database connectivity health check' })
  async checkDatabase() {
    return await this.healthService.checkDatabase();
  }

  @Public()
  @Get('redis')
  @ApiOperation({ summary: 'Redis connectivity health check' })
  checkRedis() {
    return this.healthService.checkRedis();
  }
}
