import { Module } from '@nestjs/common';
import { DBModule } from './config/DB/db.config';

@Module({
  imports: [DBModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
