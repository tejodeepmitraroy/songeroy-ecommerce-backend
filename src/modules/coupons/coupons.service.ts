import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service.js';
import type { CreateCouponDto, ValidateCouponDto } from './dto/coupon.dto.js';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    return await this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
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

  async validate(dto: ValidateCouponDto, userId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundException('Invalid or inactive coupon code');
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BadRequestException('Coupon has expired or is not yet active');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.minOrderValue && dto.orderTotal < Number(coupon.minOrderValue)) {
      throw new BadRequestException(
        `Minimum order total of ₹${coupon.minOrderValue} required for this coupon`,
      );
    }

    const userUsages = await this.prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });

    if (userUsages >= coupon.perUserLimit) {
      throw new BadRequestException('You have reached the usage limit for this coupon');
    }

    let discountAmount: number;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (dto.orderTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else {
      discountAmount = Math.min(dto.orderTotal, Number(coupon.discountValue));
    }

    return {
      isValid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount,
      finalTotal: Math.max(0, dto.orderTotal - discountAmount),
    };
  }

  async findAll() {
    return await this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
