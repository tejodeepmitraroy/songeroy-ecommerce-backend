import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service.js';
import type { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { take: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    const subtotal = cart.items.reduce((acc, item) => {
      const price = Number(item.variant.price);
      return acc + price * item.quantity;
    }, 0);

    return {
      id: cart.id,
      items: cart.items.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantTitle: item.variant.title,
        sku: item.variant.sku,
        unitPrice: Number(item.variant.price),
        currency: item.variant.currency,
        quantity: item.quantity,
        totalPrice: Number(item.variant.price) * item.quantity,
        image: item.variant.product.images[0]?.url || null,
      })),
      totalItems: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      subtotal,
    };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });

    if (!variant || !variant.isActive || !variant.product.isActive) {
      throw new NotFoundException('Product variant is not available');
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: dto.variantId,
        },
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });
    }

    return await this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return await this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    return await this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { message: 'Cart cleared successfully' };
  }
}
