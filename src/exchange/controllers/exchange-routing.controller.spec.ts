import { Test, TestingModule } from '@nestjs/testing';
import { EXCHANGES } from '../constants';
import { OrderBookService } from '../services/order-book.service';
import { ExchangeRoutingController } from './exchange-routing.controller';

describe('ExchangeRoutingController', () => {
  let controller: ExchangeRoutingController;

  const orderBookServiceMockResponse = {
    btcAmount: 1,
    usdAmount: 10000,
    exchange: EXCHANGES.COINBASE,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeRoutingController],
      providers: [
        {
          provide: OrderBookService,
          useValue: {
            getBestBuyExecutionPrice: jest
              .fn()
              .mockResolvedValueOnce(orderBookServiceMockResponse)
              .mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<ExchangeRoutingController>(
      ExchangeRoutingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return best price', async () => {
    expect(await controller.get({ amount: 1 })).toBe(
      orderBookServiceMockResponse,
    );
  });

  // on our service mock, the second resolve will be undefined to simulate all api requests to exchanges failing
  it('should error when exchanges unavailable', async () => {
    await expect(controller.get({ amount: 1 })).rejects.toThrow(
      'All crypto exchanges down',
    );
  });
});
