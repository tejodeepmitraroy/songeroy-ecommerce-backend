import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { QueryProductDto } from './dto/query-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const existing = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Product with this slug already exists');
    }

    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          basePrice: dto.basePrice,
          currency: dto.currency || 'INR',
          brandId: dto.brandId,
          isFeatured: dto.isFeatured ?? false,
          categories: dto.categoryIds?.length
            ? {
                create: dto.categoryIds.map((categoryId) => ({
                  category: { connect: { id: categoryId } },
                })),
              }
            : undefined,
          variants: dto.variants?.length
            ? {
                create: dto.variants.map((v) => ({
                  sku: v.sku,
                  title: v.title,
                  price: v.price,
                  compareAtPrice: v.compareAtPrice,
                  currency: v.currency || dto.currency || 'INR',
                })),
              }
            : undefined,
        },
        include: {
          categories: { include: { category: true } },
          variants: true,
          brand: true,
          images: true,
        },
      });

      return product;
    });
  }

  async findAll(query: QueryProductDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categories = {
        some: { categoryId: query.categoryId },
      };
    }

    if (query.brandId) {
      where.brandId = query.brandId;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {
        gte: query.minPrice,
        lte: query.maxPrice,
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price_asc') {
      orderBy = { basePrice: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { basePrice: 'desc' };
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          brand: true,
          categories: { include: { category: true } },
          variants: true,
          images: true,
        },
      }),
    ]);

    return {
      data: products,
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
      include: {
        brand: true,
        categories: { include: { category: true } },
        variants: {
          include: {
            inventoryItems: true,
            attributeValues: true,
          },
        },
        images: true,
        reviews: {
          where: { isApproved: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
