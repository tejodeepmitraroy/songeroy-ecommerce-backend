import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';

import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { InitiatePaymentDto, VerifyPaymentDto } from './dto/payment.dto.js';

@Injectable()
export class StorePaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initiatePayment(currentUser: AuthenticatedUser, dto: InitiatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== currentUser.id) {
      throw new ForbiddenException('You cannot initiate payment for this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending status');
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        orderId: order.id,
        status: PaymentStatus.CAPTURED,
      },
    });

    if (existingPayment) {
      throw new BadRequestException('Order is already paid');
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: dto.provider,
        amount: order.grandTotal,
        currency: order.currency,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentId: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      provider: payment.provider,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  }

  async verifyPayment(currentUser: AuthenticatedUser, dto: VerifyPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    if (payment.order.userId !== currentUser.id) {
      throw new ForbiddenException('Unauthorized payment verification');
    }

    if (payment.status === PaymentStatus.CAPTURED) {
      return { message: 'Payment already verified', payment };
    }

    return await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.CAPTURED,
          providerPaymentId: dto.providerPaymentId,
          transactions: {
            create: {
              type: 'CAPTURE',
              status: 'SUCCESS',
              rawPayload: { signature: dto.signature },
            },
          },
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CONFIRMED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: OrderStatus.CONFIRMED,
          comment: `Payment received via ${payment.provider} (Ref: ${dto.providerPaymentId})`,
        },
      });

      return {
        success: true,
        message: 'Payment verified and order confirmed successfully',
        payment: updatedPayment,
      };
    });
  }

  async handleWebhook(
    provider: string,
    eventId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ) {
    const existing = await this.prisma.paymentWebhookEvent.findUnique({
      where: { eventId },
    });

    if (existing) {
      return { message: 'Duplicate webhook event ignored' };
    }

    await this.prisma.paymentWebhookEvent.create({
      data: {
        provider: provider as never,
        eventId,
        eventType,
        payload: payload as never,
        isProcessed: true,
        processedAt: new Date(),
      },
    });

    return { received: true };
  }
}
