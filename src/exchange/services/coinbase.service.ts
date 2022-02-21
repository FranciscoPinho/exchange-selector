import { Injectable, Logger } from '@nestjs/common';
import { ExchangeOrderBookProvider } from '../interfaces/interfaces';
import axios from 'axios';
import { BTCUSD, COINBASE_BASE_URL, EXCHANGES } from '../constants';
import { OrderBookDto } from '../dto';

@Injectable()
export class CoinbaseService implements ExchangeOrderBookProvider {
  private readonly productMapping: { [key: string]: string } = {
    [BTCUSD]: 'BTC-USD',
  };

  getExchangeName(): string {
    return EXCHANGES.COINBASE;
  }

  async getOrderBook(product: string): Promise<OrderBookDto> {
    try {
      const response = await axios.get(
        `${COINBASE_BASE_URL}products/${this.productMapping[product]}/book?level=2`,
        {
          headers: { Accept: 'application/json' },
        },
      );

      return response.data;
    } catch (err) {
      Logger.warn(
        `coinbase exchange unavailable, reason: ${JSON.stringify(
          err?.response?.data,
        )}`,
        'coinbaseService',
      );
      throw err;
    }
  }
}
