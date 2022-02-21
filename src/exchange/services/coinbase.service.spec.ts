import { Test, TestingModule } from '@nestjs/testing';
import { BTCUSD, EXCHANGES } from '../constants';
import { CoinbaseService } from './coinbase.service';

describe('CoinbaseService', () => {
  let service: CoinbaseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinbaseService],
    }).compile();

    service = module.get<CoinbaseService>(CoinbaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return exchange name', () => {
    expect(service.getExchangeName()).toEqual(EXCHANGES.COINBASE);
  });

  it('should return orderBook', async () => {
    const orderBook = await service.getOrderBook(BTCUSD);
    expect(orderBook).toHaveProperty('bids');
    expect(orderBook).toHaveProperty('asks');
  });
});
