import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import { PrismaService } from '../../database/prisma/prisma.service.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
    [OrderStatus.PACKED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY],
    [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [OrderStatus.RETURN_REQUESTED],
    [OrderStatus.RETURN_REQUESTED]: [OrderStatus.RETURNED, OrderStatus.DELIVERED],
    [OrderStatus.RETURNED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  async createOrder(userId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
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

        const totalPhysical = variant.inventoryItems.reduce(
          (sum, inv) => sum + inv.physicalStock,
          0,
        );
        const totalReserved = variant.inventoryItems.reduce(
          (sum, inv) => sum + inv.reservedStock,
          0,
        );
        const availableStock = totalPhysical - totalReserved;

        if (availableStock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${variant.product.name} (${variant.title}). Available: ${availableStock}`,
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
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min reservation
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
              comment: 'Order placed, awaiting payment confirmation',
            },
          },
        },
        include: {
          items: true,
          address: true,
          statusHistory: true,
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
      include: {
        items: true,
        address: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, currentUser: AuthenticatedUser) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        address: true,
        payments: true,
        shipments: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isAdmin =
      currentUser.roles.includes('ADMIN') || currentUser.roles.includes('SUPER_ADMIN');

    if (order.userId !== currentUser.id && !isAdmin) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const allowedNextStatuses = this.validTransitions[order.status] || [];
    if (!allowedNextStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${dto.status}`,
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: dto.status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: dto.status,
          comment: dto.comment,
        },
      });

      return updated;
    });
  }

  async listOrdersAdmin(page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          items: true,
        },
      }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
