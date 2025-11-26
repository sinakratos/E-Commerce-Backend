import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  findAll() {
    return this.orderItemRepository.find({ relations: ['order', 'product'] });
  }

  findOne(id: number) {
    return this.orderItemRepository.findOne({
      where: { id },
      relations: ['order', 'product'],
    });
  }
}
