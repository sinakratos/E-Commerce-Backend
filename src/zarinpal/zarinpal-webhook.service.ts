import { HttpService } from '@nestjs/axios';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';

import { Order } from 'src/order/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Injectable()
export class ZarinpalWebhookService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private httpService: HttpService,
  ) {}

  async processWebhook(body: any, signature: string) {
    const { Authority } = body;

    // 1️⃣ Validate webhook origin
    if (signature !== process.env.ZARINPAL_SIGNATURE) {
      throw new ForbiddenException('Invalid signature');
    }

    // 2️⃣ Find payment record by authority
    const payment = await this.paymentRepo.findOne({
      where: { authority: Authority },
    });

    if (!payment) {
      throw new ForbiddenException('Payment not found!');
    }

    // 3️⃣ Call Zarinpal verify API
    const verifyBody = {
      MerchantID: process.env.ZARINPAL_MERCHANT_ID,
      Authority,
      Amount: payment.amount,
    };

    const { data } = await axios.post(
      process.env.ZARINPAL_CALLBACK_VERIFY_URL,
      verifyBody,
    );

    // 4️⃣ Confirm transaction from Zarinpal response
    if (data.Status !== 100 && data.Status !== 101) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
      return;
    }

    // 5️⃣ Store refId returned from Zarinpal
    payment.refId = data.RefID;
    payment.status = PaymentStatus.SUCCESS;
    await this.paymentRepo.save(payment);

    // 6️⃣ Update Order state
    const order = await this.orderRepo.findOne({
      where: { id: payment.orderId },
    });

    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);

    // 7️⃣ Log webhook
    console.log(`Verified payment: ${data.RefID}`);

    return true;
  }
}
