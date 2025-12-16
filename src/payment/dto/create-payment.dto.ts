import { IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PaymentMethod } from 'src/common/enums/payment-method.enum';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  orderId: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
