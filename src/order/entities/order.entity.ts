import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { OrderStatus } from 'src/common/enums/order-status.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}
