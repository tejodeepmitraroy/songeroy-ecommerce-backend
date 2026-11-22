import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma/prisma.service.js';

@Injectable()
export class StoreBrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.brand.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          take: 20,
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            currency: true,
          },
        },
      },
    });

    if (!brand || !brand.isActive) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }
}
