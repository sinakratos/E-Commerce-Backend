import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { OrderService } from './order.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/Role.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @Roles(Role.USER)
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(req.user.id, createOrderDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  findOne(@Param('id') id: number) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(+id, dto.status);
  }
}
