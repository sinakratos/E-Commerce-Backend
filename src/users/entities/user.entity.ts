import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/Role.enum';

@Entity('users')
export class UserEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'sina' })
  @Column({ length: 100 })
  username: string;

  @ApiProperty({ example: 'sina@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'hashed_password', description: 'Hashed value' })
  @Column()
  password: string;

  @ApiProperty({ example: Role.USER })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
