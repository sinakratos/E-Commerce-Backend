import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ZarinpalWebhookController } from './zarinpal-webhook.controller';
import { ZarinpalWebhookService } from './zarinpal-webhook.service';

import { Order } from 'src/order/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Payment, Order])],
  controllers: [ZarinpalWebhookController],
  providers: [ZarinpalWebhookService],
})
export class ZarinpalWebhookModule {}
