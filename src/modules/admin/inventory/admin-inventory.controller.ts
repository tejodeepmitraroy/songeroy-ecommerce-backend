import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard.js';
import { AdminInventoryService } from './admin-inventory.service.js';
import { AdjustStockDto, CreateWarehouseDto } from './dto/inventory.dto.js';

@ApiTags('Admin Inventory')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: AdminInventoryService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Get('variant/:variantId')
  @ApiOperation({ summary: 'Admin: Get stock breakdown for a product variant across warehouses' })
  async getVariantStock(@Param('variantId') variantId: string) {
    return await this.inventoryService.getVariantStock(variantId);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Post('adjust')
  @ApiOperation({ summary: 'Admin: Adjust stock quantity for variant with audit log' })
  async adjustStock(@Body() dto: AdjustStockDto) {
    return await this.inventoryService.adjustStock(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Get('movements')
  @ApiOperation({ summary: 'Admin: List recent inventory movements' })
  @ApiQuery({ name: 'variantId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMovements(@Query('variantId') variantId?: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return await this.inventoryService.getMovements(variantId, limitNum);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Post('warehouses')
  @ApiOperation({ summary: 'Admin: Create warehouse location' })
  async createWarehouse(@Body() dto: CreateWarehouseDto) {
    return await this.inventoryService.createWarehouse(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Get('warehouses')
  @ApiOperation({ summary: 'Admin: List active warehouses' })
  async getWarehouses() {
    return await this.inventoryService.getWarehouses();
  }
}
