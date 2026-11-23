import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class StoreOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cartz.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                inventoryItems: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty cart');
    }

    return await this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of cart.items) {
        const variant = item.variant;

        if (!variant.isActive || !variant.product.isActive) {
          throw new BadRequestException(`Product ${variant.product.name} is no longer available`);
        }

        const physical = variant.inventoryItems.reduce(
          (a: number, b: { physicalStock: number }) => a + b.physicalStock,
          0,
        );
        const reserved = variant.inventoryItems.reduce(
          (a: number, b: { reservedStock: number }) => a + b.reservedStock,
          0,
        );
        const available = physical - reserved;

        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${variant.product.name} - ${variant.title}. Only ${available} available.`,
          );
        }

        const unitPrice = Number(variant.price);
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          variantId: variant.id,
          productName: variant.product.name,
          sku: variant.sku,
          unitPrice,
          quantity: item.quantity,
          discountAmount: 0,
          taxAmount: 0,
          totalPrice: itemTotal,
        });

        await tx.stockReservation.create({
          data: {
            variantId: variant.id,
            quantity: item.quantity,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });
      }

      let discountTotal = 0;
      if (dto.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: dto.couponCode.toUpperCase() },
        });

        if (
          coupon &&
          coupon.isActive &&
          new Date() >= coupon.startDate &&
          new Date() <= coupon.endDate
        ) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountTotal = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscount && discountTotal > Number(coupon.maxDiscount)) {
              discountTotal = Number(coupon.maxDiscount);
            }
          } else {
            discountTotal = Number(coupon.discountValue);
          }
        }
      }

      const shippingTotal = subtotal > 1000 ? 0 : 99;
      const grandTotal = Math.max(0, subtotal - discountTotal + shippingTotal);

      const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
          currency: 'INR',
          subtotal,
          discountTotal,
          taxTotal: 0,
          shippingTotal,
          grandTotal,
          notes: dto.notes,
          address: {
            create: {
              recipientName: dto.shippingAddress.recipientName,
              phoneNumber: dto.shippingAddress.phoneNumber,
              streetAddress: dto.shippingAddress.streetAddress,
              apartment: dto.shippingAddress.apartment,
              city: dto.shippingAddress.city,
              state: dto.shippingAddress.state,
              postalCode: dto.shippingAddress.postalCode,
              country: dto.shippingAddress.country || 'IN',
            },
          },
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              comment: 'Order placed by customer',
            },
          },
        },
        include: {
          items: true,
          address: true,
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  async getCustomerOrders(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: true,
        shipment: true,
        address: true,
      },
    });
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        address: true,
        payments: true,
        shipment: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.getOrderById(orderId, userId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled by the customer');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.CANCELLED,
          comment: 'Cancelled by customer',
        },
      });

      for (const item of order.items) {
        await tx.stockReservation.deleteMany({
          where: { variantId: item.variantId },
        });
      }

      return updated;
    });
  }
}
