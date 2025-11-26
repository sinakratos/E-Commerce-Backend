import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private dataSource: DataSource,
  ) {}

  // ✅ TOTAL PRICE IS CALCULATED RIGHT HERE ✅
  async create(userId: number, createOrderDto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      let totalPrice = 0;

      const order = manager.create(Order, {
        user,
        status: OrderStatus.PENDING,
        totalPrice: 0,
      });

      const savedOrder = await manager.save(order);

      for (const item of createOrderDto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product) throw new NotFoundException('Product not found');

        if (product.stock < item.quantity) {
          throw new BadRequestException('Not enough stock');
        }

        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;

        const orderItem = manager.create(OrderItem, {
          order: savedOrder,
          product,
          quantity: item.quantity,
          price: product.price,
        });

        await manager.save(orderItem);

        product.stock -= item.quantity;
        await manager.save(product);
      }

      savedOrder.totalPrice = totalPrice;
      return manager.save(savedOrder);
    });
  }

  findAll() {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
    });
  }

  findOne(id: number) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    return this.orderRepository.save(order);
  }
}
