import { Module } from '@nestjs/common';
import { DBModule } from './config/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DBModule, UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
