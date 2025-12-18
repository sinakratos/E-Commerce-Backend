import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Order } from '../../order/entities/order.entity';

import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ unique: true })
  authority: string;

  @Column({ nullable: true })
  refId: string;

  @Column()
  orderId: number;

  @CreateDateColumn()
  createdAt: Date;
}
