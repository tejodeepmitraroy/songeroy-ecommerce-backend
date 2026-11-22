import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType } from '@prisma/client';

import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { ValidateCouponDto } from './dto/coupon.dto.js';

@Injectable()
export class StoreCouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(dto: ValidateCouponDto, userId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundException('Invalid or inactive coupon code');
    }

    const now = new Date();
    if (now < coupon.startDate || (coupon.endDate && now > coupon.endDate)) {
      throw new BadRequestException('Coupon has expired or is not yet active');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon total usage limit reached');
    }

    if (coupon.minOrderValue && dto.orderTotal < Number(coupon.minOrderValue)) {
      throw new BadRequestException(
        `Minimum order total of ₹${coupon.minOrderValue} required for this coupon`,
      );
    }

    const userUsages = await this.prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId,
      },
    });

    if (userUsages >= (coupon.perUserLimit || 1)) {
      throw new BadRequestException('You have reached the maximum usage limit for this coupon');
    }

    let discountAmount: number;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (dto.orderTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    discountAmount = Math.min(discountAmount, dto.orderTotal);

    return {
      isValid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      finalTotal: Math.max(0, dto.orderTotal - discountAmount),
    };
  }
}
