import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateShippingMethodDto {
  @ApiProperty({ example: 'Standard Delivery' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 99.0 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiPropertyOptional({ example: '3-5 business days' })
  @IsString()
  @IsOptional()
  estimatedDays?: string;
}

export class CreateShipmentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: 'BlueDart' })
  @IsString()
  @IsNotEmpty()
  carrier!: string;

  @ApiProperty({ example: 'BD123456789IN' })
  @IsString()
  @IsNotEmpty()
  trackingNumber!: string;
}
