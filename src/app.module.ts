import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DBModule } from './config/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DBModule,
    UsersModule,
    AuthModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    OrderItemModule,
  ],
  providers: [],
})
export class AppModule {}
