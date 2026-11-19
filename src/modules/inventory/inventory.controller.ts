import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import type { AdjustStockDto, CreateWarehouseDto } from './dto/inventory.dto.js';
import { InventoryService } from './inventory.service.js';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Get('variant/:variantId')
  @ApiOperation({ summary: 'Get stock level breakdown for a variant' })
  async getVariantStock(@Param('variantId') variantId: string) {
    return await this.inventoryService.getVariantStock(variantId);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Post('adjust')
  @ApiOperation({ summary: 'Adjust stock quantity for variant at warehouse' })
  async adjustStock(@Body() dto: AdjustStockDto) {
    return await this.inventoryService.adjustStock(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Get('movements')
  @ApiOperation({ summary: 'List recent inventory movement logs' })
  @ApiQuery({ name: 'variantId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMovements(@Query('variantId') variantId?: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return await this.inventoryService.getMovements(variantId, limitNum);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Post('warehouses')
  @ApiOperation({ summary: 'Admin: Create warehouse' })
  async createWarehouse(@Body() dto: CreateWarehouseDto) {
    return await this.inventoryService.createWarehouse(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.INVENTORY_MANAGER)
  @Get('warehouses')
  @ApiOperation({ summary: 'List warehouses' })
  async getWarehouses() {
    return await this.inventoryService.getWarehouses();
  }
}
