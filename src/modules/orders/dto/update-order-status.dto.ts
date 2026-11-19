import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status!: OrderStatus;

  @ApiPropertyOptional({ example: 'Dispatched via BlueDart courier' })
  @IsString()
  @IsOptional()
  comment?: string;
}
