import { Test, TestingModule } from '@nestjs/testing';
import { BTCUSD, EXCHANGES } from '../constants';
import { OrderBookDto } from '../dto';
import { BinanceService } from './binance.service';
import { CoinbaseService } from './coinbase.service';
import { OrderBookService } from './order-book.service';

describe('OrderBookService', () => {
  let service: OrderBookService;

  // when buying up the entire amount, binance should be the preferred exchange
  // but coinbase should win when amount 0.5
  const coinbaseOrderBookMock: OrderBookDto = {
    asks: [
      ['10000', '0.5'],
      ['12000', '0.5'],
    ],
    bids: [],
  };
  const binanceOrderBookMock: OrderBookDto = {
    asks: [
      ['10100', '0.5'],
      ['11000', '0.5'],
    ],
    bids: [],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderBookService,
        {
          provide: CoinbaseService,
          useValue: {
            getOrderBook: jest.fn(() => coinbaseOrderBookMock),
            getExchangeName: jest.fn(() => EXCHANGES.COINBASE),
          },
        },
        {
          provide: BinanceService,
          useValue: {
            getOrderBook: jest.fn(() => binanceOrderBookMock),
            getExchangeName: jest.fn(() => EXCHANGES.BINANCE),
          },
        },
        {
          provide: 'ExchangesProvider',
          useFactory: (binance, coinbase) => [binance, coinbase],
          inject: [BinanceService, CoinbaseService],
        },
      ],
    }).compile();

    service = module.get<OrderBookService>(OrderBookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('OrderBookService.calculateBestBuyExecutionPrice', () => {
    it('calculate correctly for full order', () => {
      const expectedResult = {
        btcAmount: 0.7,
        usdAmount: 10571.43, //(0.5/0.7)*10000+(0.2/0.7)*12000
      };
      expect(
        service.calculateBestBuyExecutionPrice(coinbaseOrderBookMock, 0.7),
      ).toEqual(expectedResult);
    });

    it('return partially filled order price', () => {
      const expectedResult = {
        btcAmount: 1,
        usdAmount: 11000, // 0.5*10000+0.5*12000
      };
      // we asking for 1.5 but the order book can only fulfill 1 BTC
      expect(
        service.calculateBestBuyExecutionPrice(coinbaseOrderBookMock, 1.5),
      ).toEqual(expectedResult);
    });
  });

  describe('OrderBookService.getBestBuyExecutionPrice', () => {
    it('choose coinbase for smaller order', async () => {
      const wantedAmount = 0.5;
      const expectedResult = {
        btcAmount: wantedAmount,
        usdAmount: 10000,
        exchange: EXCHANGES.COINBASE,
      };
      expect(
        await service.getBestBuyExecutionPrice(BTCUSD, wantedAmount),
      ).toEqual(expectedResult);
    });

    it('choose binance for larger order', async () => {
      const wantedAmount = 1;
      const expectedResult = {
        btcAmount: wantedAmount,
        usdAmount: 10550, // 0.5*10100+0.5*11000
        exchange: EXCHANGES.BINANCE,
      };

      expect(
        await service.getBestBuyExecutionPrice(BTCUSD, wantedAmount),
      ).toEqual(expectedResult);
    });
  });
});
