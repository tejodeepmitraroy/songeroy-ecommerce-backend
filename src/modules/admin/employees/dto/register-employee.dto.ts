import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterEmployeeDto {
  @ApiProperty({ example: 'employee@songeroy.com', description: 'Employee corporate email' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    minLength: 8,
    description: 'Initial login password',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

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

  @ApiProperty({
    example: [RoleName.MANAGER],
    enum: RoleName,
    isArray: true,
    description: 'Staff roles assigned to the employee',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(RoleName, { each: true })
  roles!: RoleName[];
}
