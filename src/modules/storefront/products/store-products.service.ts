import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { QueryProductDto } from './dto/query-product.dto.js';

@Injectable()
export class StoreProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (query.search) {
      where['OR'] = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where['categories'] = {
        some: { categoryId: query.categoryId },
      };
    }

    if (query.brandId) {
      where['brandId'] = query.brandId;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where['basePrice'] = {
        gte: query.minPrice,
        lte: query.maxPrice,
      };
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (query.sort === 'price_asc') orderBy['basePrice'] = 'asc';
    else if (query.sort === 'price_desc') orderBy['basePrice'] = 'desc';
    else orderBy['createdAt'] = 'desc';

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          basePrice: true,
          currency: true,
          isFeatured: true,
          createdAt: true,
          brand: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
          categories: {
            select: {
              category: { select: { id: true, name: true, slug: true } },
            },
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              sku: true,
              title: true,
              price: true,
              compareAtPrice: true,
              currency: true,
            },
          },
          images: {
            orderBy: { position: 'asc' },
            select: { id: true, url: true, altText: true, isPrimary: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        basePrice: true,
        currency: true,
        isFeatured: true,
        isActive: true,
        createdAt: true,
        brand: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        categories: {
          select: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            title: true,
            price: true,
            compareAtPrice: true,
            currency: true,
            inventoryItems: {
              select: {
                physicalStock: true,
                reservedStock: true,
              },
            },
          },
        },
        images: {
          orderBy: { position: 'asc' },
          select: { id: true, url: true, altText: true, isPrimary: true },
        },
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException(`Product not found`);
    }

    return {
      ...product,
      variants: product.variants.map((v) => {
        const physical = v.inventoryItems.reduce(
          (a: number, b: { physicalStock: number }) => a + b.physicalStock,
          0,
        );
        const reserved = v.inventoryItems.reduce(
          (a: number, b: { reservedStock: number }) => a + b.reservedStock,
          0,
        );
        return {
          id: v.id,
          sku: v.sku,
          title: v.title,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          currency: v.currency,
          inStock: physical - reserved > 0,
        };
      }),
    };
  }
}
