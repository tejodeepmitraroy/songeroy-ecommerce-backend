import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../../../database/prisma/prisma.service.js';

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [totalOrders, totalCustomers, totalProducts, paidOrders, lowStockVariants] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.user.count(),
        this.prisma.product.count(),
        this.prisma.order.findMany({
          where: {
            status: {
              in: [
                OrderStatus.CONFIRMED,
                OrderStatus.PROCESSING,
                OrderStatus.PACKED,
                OrderStatus.SHIPPED,
                OrderStatus.OUT_FOR_DELIVERY,
                OrderStatus.DELIVERED,
              ],
            },
          },
          select: { grandTotal: true },
        }),
        this.prisma.inventory.count({
          where: { physicalStock: { lte: 5 } },
        }),
      ]);

    const totalRevenue = paidOrders.reduce(
      (sum: number, order: { grandTotal: unknown }) => sum + Number(order.grandTotal),
      0,
    );

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockVariants,
    };
  }
}
