import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DBModule } from './config/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DBModule,
    UsersModule,
    AuthModule,
    CategoryModule,
  ],
  providers: [],
})
export class AppModule {}
