import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Get 20% off up to ₹500' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ example: 20.0 })
  @IsNumber()
  @IsPositive()
  discountValue!: number;

  @ApiPropertyOptional({ example: 499.0 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 500.0 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxDiscount?: number;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  perUserLimit?: number = 1;
}
