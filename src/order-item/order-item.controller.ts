import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { OrderItemService } from './order-item.service';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/Role.enum';

@ApiTags('Order Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order-items')
export class OrderItemController {
  constructor(private OrderItemService: OrderItemService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.OrderItemService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: number) {
    return this.OrderItemService.findOne(+id);
  }
}
