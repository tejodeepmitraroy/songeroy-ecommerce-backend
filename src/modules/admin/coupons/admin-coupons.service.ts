import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { CreateCouponDto } from './dto/coupon.dto.js';

@Injectable()
export class AdminCouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.coupon.findMany({
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }

    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase();
    const existing = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    return await this.prisma.coupon.create({
      data: {
        code,
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue,
        maxDiscount: dto.maxDiscount,
        startDate: dto.startDate,
        endDate: dto.endDate,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit ?? 1,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return await this.prisma.coupon.delete({
      where: { id },
    });
  }
}
