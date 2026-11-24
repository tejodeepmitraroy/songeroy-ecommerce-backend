import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { db } from '../../prisma/db.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  readonly db = db;

  async onModuleInit(): Promise<void> {
    try {
      // Prisma v8 connects lazily via its connection pool; run a lightweight query to verify on startup
      await this.db.sql(`SELECT 1`);
      this.logger.log('Prisma connected to PostgreSQL database successfully');
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL database', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.close();
    this.logger.log('Prisma disconnected from PostgreSQL database');
  }
}
