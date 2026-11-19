import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service.js';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  checkApp(): { status: string; uptime: number; timestamp: string } {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  async checkDatabase(): Promise<{ status: string; latencyMs: number }> {
    const start = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      latencyMs: Date.now() - start,
    };
  }

  checkRedis(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Redis health check endpoint available',
    };
  }
}
