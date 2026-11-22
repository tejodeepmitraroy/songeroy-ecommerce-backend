import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryMovementType } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ description: 'Product Variant ID' })
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @ApiProperty({ example: 10, description: 'Positive or negative adjustment' })
  @IsInt()
  quantity!: number;

  @ApiProperty({ enum: InventoryMovementType })
  @IsEnum(InventoryMovementType)
  type!: InventoryMovementType;

  @ApiPropertyOptional({ example: 'Damaged goods write-off' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Main Mumbai Fulfillment Center' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'WH-MUM-01' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;
}
