import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DBModule } from './config/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DBModule,
    UsersModule,
    AuthModule,
    CategoryModule,
    ProductModule,
  ],
  providers: [],
})
export class AppModule {}
