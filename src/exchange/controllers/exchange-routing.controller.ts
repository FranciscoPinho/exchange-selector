import { Controller, Get, HttpException, Query } from '@nestjs/common';
import { IsNumber, IsPositive } from 'class-validator';
import { BestPriceDto } from '../dto';
import { BTCUSD } from '../constants';
import { OrderBookService } from '../services/order-book.service';
import { Type } from 'class-transformer';

export class AmountQueryParamDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;
}

@Controller()
export class ExchangeRoutingController {
  constructor(private readonly orderBookService: OrderBookService) {}

  @Get('exchange-routing')
  async get(@Query() queryParams: AmountQueryParamDto): Promise<BestPriceDto> {
    const bestPrice = await this.orderBookService.getBestBuyExecutionPrice(
      BTCUSD,
      queryParams.amount,
    );
    // in case we cannot get any order book from any exchange
    if (!bestPrice) {
      throw new HttpException('All crypto exchanges down', 503);
    }

    return bestPrice;
  }
}
