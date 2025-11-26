import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Role } from 'src/common/enums/Role.enum';

import { Order } from 'src/order/entities/order.entity';

@Entity('users')
export class UserEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'sina' })
  @Column({ length: 100, unique: true })
  username: string;

  @ApiProperty({ example: '989123456789' })
  @Column({ unique: true, nullable: true })
  phone: string;

  @ApiProperty({ example: 'sina@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
