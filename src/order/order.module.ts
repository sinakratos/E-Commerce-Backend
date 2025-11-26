import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

import { Order } from './entities/order.entity';

import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Product } from 'src/product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, UserEntity])],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
