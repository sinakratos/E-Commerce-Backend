import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from './entities/order.entity';

import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(userId: number, totalPrice: number): Promise<Order> {
    const order = this.orderRepository.create({
      user: { id: userId } as any,
      totalPrice,
    });

    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'items'],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    await this.findOne(id);
    // await this.orderRepository.update(id, { status });
    return this.findOne(id);
  }
}
