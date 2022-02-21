import { Module } from '@nestjs/common';
import { BinanceService } from '../services/binance.service';
import { CoinbaseService } from '../services/coinbase.service';
import { OrderBookService } from '../services/order-book.service';
import { ExchangeRoutingController } from '../controllers/exchange-routing.controller';

@Module({
  controllers: [ExchangeRoutingController],
  providers: [
    OrderBookService,
    BinanceService,
    CoinbaseService,
    {
      provide: 'ExchangesProvider',
      useFactory: (binance, coinbase) => [binance, coinbase],
      inject: [BinanceService, CoinbaseService],
    },
  ],
})
export class ExchangeModule {}
