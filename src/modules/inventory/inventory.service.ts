import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service.js';
import type { AdjustStockDto, CreateWarehouseDto } from './dto/inventory.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createWarehouse(dto: CreateWarehouseDto) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException('Warehouse with this code already exists');
    }

    return await this.prisma.warehouse.create({
      data: dto,
    });
  }

  async getWarehouses() {
    return await this.prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getVariantStock(variantId: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: { variantId },
      include: { warehouse: true },
    });

    const physicalStock = inventories.reduce((a, b) => a + b.physicalStock, 0);
    const reservedStock = inventories.reduce((a, b) => a + b.reservedStock, 0);
    const availableStock = Math.max(0, physicalStock - reservedStock);

    return {
      variantId,
      physicalStock,
      reservedStock,
      availableStock,
      warehouses: inventories.map((i) => ({
        warehouseId: i.warehouseId,
        warehouseName: i.warehouse.name,
        physical: i.physicalStock,
        reserved: i.reservedStock,
        available: Math.max(0, i.physicalStock - i.reservedStock),
      })),
    };
  }

  async adjustStock(dto: AdjustStockDto) {
    return await this.prisma.$transaction(async (tx) => {
      let inventory = await tx.inventory.findUnique({
        where: {
          variantId_warehouseId: {
            variantId: dto.variantId,
            warehouseId: dto.warehouseId,
          },
        },
      });

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            variantId: dto.variantId,
            warehouseId: dto.warehouseId,
            physicalStock: 0,
            reservedStock: 0,
          },
        });
      }

      const newPhysical = inventory.physicalStock + dto.quantity;
      if (newPhysical < 0) {
        throw new BadRequestException('Physical stock cannot become negative');
      }

      const updated = await tx.inventory.update({
        where: { id: inventory.id },
        data: { physicalStock: newPhysical },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          quantity: dto.quantity,
          type: dto.type,
          reason: dto.reason,
        },
      });

      return {
        ...updated,
        availableStock: Math.max(0, updated.physicalStock - updated.reservedStock),
      };
    });
  }

  async getMovements(variantId?: string, limit = 50) {
    return await this.prisma.inventoryMovement.findMany({
      where: variantId
        ? {
            inventory: { variantId },
          }
        : undefined,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        inventory: {
          include: {
            variant: true,
            warehouse: true,
          },
        },
      },
    });
  }
}
