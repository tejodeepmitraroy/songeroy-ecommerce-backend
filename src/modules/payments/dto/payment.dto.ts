import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ enum: PaymentProvider, default: PaymentProvider.RAZORPAY })
  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Internal Payment ID' })
  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @ApiProperty({
    description:
      'Payment Provider Reference ID (e.g. Razorpay Payment ID or Stripe Payment Intent ID)',
  })
  @IsString()
  @IsNotEmpty()
  providerPaymentId!: string;

  @ApiProperty({ description: 'Signature or verification secret' })
  @IsString()
  @IsNotEmpty()
  signature!: string;
}
