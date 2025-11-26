import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { OrderService } from './order.service';

import { Role } from '../common/enums/Role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(Role.USER)
  create(@Request() req, @Body('totalPrice') totalPrice: number) {
    return this.orderService.create(req.user.id, totalPrice);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    return this.orderService.updateStatus(id, status);
  }
}
