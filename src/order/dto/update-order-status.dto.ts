import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { OrderStatus } from 'src/common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: OrderStatus.PAID })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
