import { Test, TestingModule } from '@nestjs/testing';
import { BTCUSD, EXCHANGES } from '../constants';
import { BinanceService } from './binance.service';

describe('BinanceService', () => {
  let service: BinanceService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BinanceService],
    }).compile();

    service = module.get<BinanceService>(BinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return exchange name', () => {
    expect(service.getExchangeName()).toEqual(EXCHANGES.BINANCE);
  });

  it('should return orderBook', async () => {
    const orderBook = await service.getOrderBook(BTCUSD);
    expect(orderBook).toHaveProperty('bids');
    expect(orderBook).toHaveProperty('asks');
  });
});
