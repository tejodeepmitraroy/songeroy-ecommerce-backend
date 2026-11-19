import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service.js';
import type { CreateReviewDto } from './dto/review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const verifiedPurchase = await this.prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
        items: {
          some: {
            variant: {
              productId: dto.productId,
            },
          },
        },
      },
    });

    return await this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        isVerified: Boolean(verifiedPurchase),
        isApproved: true, // auto-approve default or set to false for manual moderation
      },
    });
  }

  async getProductReviews(productId: string) {
    return await this.prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveReview(reviewId: string, isApproved: boolean) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return await this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
    });
  }
}
