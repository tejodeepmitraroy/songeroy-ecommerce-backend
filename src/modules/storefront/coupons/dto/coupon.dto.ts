import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @IsPositive()
  orderTotal!: number;
}
