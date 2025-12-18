import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';

import { ZarinpalWebhookService } from './zarinpal-webhook.service';

@Controller('webhooks')
export class ZarinpalWebhookController {
  constructor(private service: ZarinpalWebhookService) {}

  @Post('zarinpal')
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-zarinpal-signature') signature: string,
  ) {
    await this.service.processWebhook(body, signature);
    return { received: true };
  }
}
