import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, ArrayMinSize, IsArray } from 'class-validator';

import { CreateOrderItemDto } from '../../order-item/dto/create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    example: [
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
