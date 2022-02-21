import { Module } from '@nestjs/common';
import { ExchangeModule } from './exchange/module/exchange.module';

@Module({
  imports: [ExchangeModule],
})
export class AppModule {}
