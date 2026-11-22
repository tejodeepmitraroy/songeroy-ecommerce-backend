import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class OrderAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({ example: '123 Marine Drive' })
  @IsString()
  @IsNotEmpty()
  streetAddress!: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsString()
  @IsOptional()
  apartment?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: '400020' })
  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @ApiPropertyOptional({ example: 'IN', default: 'IN' })
  @IsString()
  @IsOptional()
  country?: string = 'IN';
}

export class CreateOrderDto {
  @ApiProperty({ type: OrderAddressDto })
  @ValidateNested()
  @Type(() => OrderAddressDto)
  @IsNotEmpty()
  shippingAddress!: OrderAddressDto;

  @ApiPropertyOptional({ example: 'WELCOME10' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Please call before delivery' })
  @IsString()
  @IsOptional()
  notes?: string;
}
