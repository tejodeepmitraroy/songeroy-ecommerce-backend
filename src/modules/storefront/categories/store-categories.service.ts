import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma/prisma.service.js';

@Injectable()
export class StoreCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: { where: { isActive: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: { where: { isActive: true } },
        products: {
          take: 20,
          include: {
            product: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!category || !category.isActive) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
