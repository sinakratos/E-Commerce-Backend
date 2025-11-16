import { Module } from '@nestjs/common';
import { DBModule } from './config/DB/db.config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DBModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
