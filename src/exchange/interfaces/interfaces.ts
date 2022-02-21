import { OrderBookDto } from '../dto';

export interface ExchangeOrderBookProvider {
  getExchangeName(): string;
  getOrderBook(product: string): Promise<OrderBookDto>;
}
