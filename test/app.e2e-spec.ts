import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { vi } from 'vitest';

import { PrismaService } from '../src/database/prisma/prisma.service.js';
import { HealthModule } from '../src/modules/health/health.module.js';
import { HealthService } from '../src/modules/health/health.service.js';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const mockHealthService = {
      checkApp: () => ({ status: 'ok', uptime: 10, timestamp: new Date().toISOString() }),
      checkDatabase: async () => ({ status: 'ok', latencyMs: 5 }),
      checkRedis: () => ({ status: 'ok', message: 'Redis check ok' }),
    };

    const mockPrismaService = {
      $connect: vi.fn().mockResolvedValue(undefined),
      $disconnect: vi.fn().mockResolvedValue(undefined),
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(HealthService)
      .useValue(mockHealthService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
