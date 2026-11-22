import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { CreateProductDto, CreateVariantDto } from './dto/create-product.dto.js';
import type { QueryProductDto } from './dto/query-product.dto.js';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

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

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          variants: {
            include: {
              inventoryItems: true,
            },
          },
          categories: { include: { category: true } },
          brand: true,
        },
        orderBy: { createdAt: 'desc' },
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

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            inventoryItems: true,
          },
        },
        categories: { include: { category: true } },
        brand: true,
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

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
      return await tx.product.create({
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
                create: dto.categoryIds.map((categoryId: string) => ({
                  category: { connect: { id: categoryId } },
                })),
              }
            : undefined,
          variants: dto.variants?.length
            ? {
                create: dto.variants.map((v: CreateVariantDto) => ({
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
        },
      });
    });
  }

  async update(id: string, data: Partial<CreateProductDto>) {
    await this.findById(id);

    return await this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        currency: data.currency,
        brandId: data.brandId,
        isFeatured: data.isFeatured,
      },
      include: {
        categories: { include: { category: true } },
        variants: true,
        brand: true,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
