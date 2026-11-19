import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service.js';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(userId: string) {
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId },
        include: { items: true },
      });
    }

    const productIds = wishlist.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { take: 1 },
      },
    });

    return {
      id: wishlist.id,
      items: products.map((p) => ({
        productId: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: Number(p.basePrice),
        currency: p.currency,
        image: p.images[0]?.url || null,
      })),
    };
  }

  async addItem(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found or inactive');
    }

    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId },
      });
    }

    await this.prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      create: {
        wishlistId: wishlist.id,
        productId,
      },
      update: {},
    });

    return await this.getWishlist(userId);
  }

  async removeItem(userId: string, productId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (wishlist) {
      await this.prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return await this.getWishlist(userId);
  }
}
