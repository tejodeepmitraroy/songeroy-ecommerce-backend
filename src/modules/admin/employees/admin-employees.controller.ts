import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminEmployeesService } from './admin-employees.service.js';
import { QueryEmployeeDto } from './dto/query-employee.dto.js';
import { RegisterEmployeeDto } from './dto/register-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

@ApiTags('Admin Employees')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('employees')
export class AdminEmployeesController {
  constructor(private readonly employeesService: AdminEmployeesService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Register a new employee/staff member' })
  async register(@Body() dto: RegisterEmployeeDto) {
    return await this.employeesService.register(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.MANAGER)
  @Get()
  @ApiOperation({ summary: 'Admin: List all employees with pagination and filters' })
  async findAll(@Query() query: QueryEmployeeDto) {
    return await this.employeesService.findAll(query);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.MANAGER)
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get employee details by ID' })
  async findById(@Param('id') id: string) {
    return await this.employeesService.findById(id);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update employee profile, assigned roles, or status' })
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return await this.employeesService.update(id, dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Remove an employee/user' })
  async remove(@Param('id') id: string, @CurrentUser() currentUser?: AuthenticatedUser) {
    return await this.employeesService.remove(id, currentUser?.id);
  }
}
