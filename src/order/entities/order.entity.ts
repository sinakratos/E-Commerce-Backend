import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
// import { OrderItem } from '../../order-item/entities/order-item.entity';
// import { OrderStatus } from '../../common/enums/order-status.enum';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column('decimal')
  totalPrice: number;

  //   @Column({
  //     type: 'enum',
  //     enum: OrderStatus,
  //     default: OrderStatus.PENDING,
  //   })
  //   status: OrderStatus;

  //   @OneToMany(() => OrderItem, (item) => item.order)
  //   items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}
