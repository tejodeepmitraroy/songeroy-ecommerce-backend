import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { CreateBrandDto } from './dto/create-brand.dto.js';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBrandDto) {
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const existing = await this.prisma.brand.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Brand with this slug already exists');
    }

    return await this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async findAll() {
    return await this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }
}
