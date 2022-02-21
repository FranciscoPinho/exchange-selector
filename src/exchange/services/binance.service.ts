import { Logger, Injectable } from '@nestjs/common';
import { ExchangeOrderBookProvider } from '../interfaces/interfaces';
import axios from 'axios';
import { BTCUSD, BINANCE_BASE_URL, EXCHANGES } from '../constants';
import { OrderBookDto } from '../dto';

@Injectable()
export class BinanceService implements ExchangeOrderBookProvider {
  private readonly productMapping: { [key: string]: string } = {
    [BTCUSD]: 'BTCUSDT',
  };

  getExchangeName(): string {
    return EXCHANGES.BINANCE;
  }

  async getOrderBook(product: string): Promise<OrderBookDto> {
    try {
      const response = await axios.get(
        `${BINANCE_BASE_URL}depth?symbol=${this.productMapping[product]}`,
        {
          headers: { Accept: 'application/json' },
        },
      );

      return response.data;
    } catch (err) {
      Logger.warn(
        `binance exchange unavailable, reason: ${err?.response?.data}`,
        'binanceService',
      );
      throw err;
    }
  }
}
