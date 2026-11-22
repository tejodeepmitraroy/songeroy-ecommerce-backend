import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'Jane', description: 'Employee first name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Employee last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'Employee phone number' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: [RoleName.INVENTORY_MANAGER],
    enum: RoleName,
    isArray: true,
    description: 'Updated staff roles',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(RoleName, { each: true })
  @IsOptional()
  roles?: RoleName[];

  @ApiPropertyOptional({ example: true, description: 'Employee active account status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
