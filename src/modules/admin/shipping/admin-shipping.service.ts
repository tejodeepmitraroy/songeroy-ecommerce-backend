import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { CreateShipmentDto, CreateShippingMethodDto } from './dto/shipping.dto.js';

@Injectable()
export class AdminShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async getMethods() {
    return await this.prisma.shippingMethod.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async createMethod(dto: CreateShippingMethodDto) {
    return await this.prisma.shippingMethod.create({
      data: dto,
    });
  }

  async createShipment(dto: CreateShipmentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return await this.prisma.shipment.create({
      data: {
        orderId: dto.orderId,
        trackingNumber: dto.trackingNumber,
        carrier: dto.carrier,
        status: 'SHIPPED',
        trackingEvents: {
          create: {
            status: 'LABEL_CREATED',
            description: 'Shipment created by fulfillment team',
          },
        },
      },
      include: {
        trackingEvents: true,
      },
    });
  }
}
