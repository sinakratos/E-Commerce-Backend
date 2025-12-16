import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePaymentDto } from './dto/create-payment.dto';

import { Payment } from './entities/payment.entity';

import { Order } from '../order/entities/order.entity';

import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  async create(dto: CreatePaymentDto) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order already paid or closed');
    }

    const payment = this.paymentRepo.create({
      order,
      amount: order.totalPrice,
      method: dto.method,
      status: PaymentStatus.SUCCESS, // simulate gateway success (make logic another time)
    });

    await this.paymentRepo.save(payment);

    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);

    return payment;
  }

  findAll() {
    return this.paymentRepo.find({ relations: ['order'] });
  }

  findOne(id: number) {
    return this.paymentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
  }
}
