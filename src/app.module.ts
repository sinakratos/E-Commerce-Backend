import { Module } from '@nestjs/common';
import { DBModule } from './config/db.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DBModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
