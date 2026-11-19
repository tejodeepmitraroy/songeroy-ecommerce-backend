import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service.js';
import type { CreateShipmentDto, CreateShippingMethodDto } from './dto/shipping.dto.js';

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async createMethod(dto: CreateShippingMethodDto) {
    return await this.prisma.shippingMethod.create({
      data: dto,
    });
  }

  async getMethods() {
    return await this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async createShipment(dto: CreateShipmentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      order.status !== OrderStatus.CONFIRMED &&
      order.status !== OrderStatus.PROCESSING &&
      order.status !== OrderStatus.PACKED
    ) {
      throw new BadRequestException(`Cannot create shipment for order in ${order.status} state`);
    }

    return await this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          orderId: order.id,
          carrier: dto.carrier,
          trackingNumber: dto.trackingNumber,
          status: 'SHIPPED',
          shippedAt: new Date(),
          trackingEvents: {
            create: {
              status: 'SHIPPED',
              description: `Package picked up by carrier ${dto.carrier}`,
            },
          },
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.SHIPPED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.SHIPPED,
          comment: `Shipment created with ${dto.carrier} (Tracking: ${dto.trackingNumber})`,
        },
      });

      return shipment;
    });
  }

  async getTracking(trackingNumber: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        trackingEvents: { orderBy: { timestamp: 'asc' } },
        order: { select: { orderNumber: true } },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Tracking number not found');
    }

    return shipment;
  }
}
