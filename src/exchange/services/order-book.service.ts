import { Injectable, Inject, Logger } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { OrderBookDto, BestPriceDto } from '../dto';
import { ExchangeOrderBookProvider } from '../interfaces/interfaces';

@Injectable()
export class OrderBookService {
  constructor(
    @Inject('ExchangesProvider')
    private exchangesProvider: ExchangeOrderBookProvider[],
  ) {}

  // we use bigNumber here for no JS float precision errors
  calculateBestBuyExecutionPrice(
    orderBook: OrderBookDto,
    wantedAmount: number,
  ): { btcAmount: number; usdAmount: number } {
    const ordersForWantedAmount: {
      orderPrice: BigNumber;
      filledAmount: BigNumber;
    }[] = [];
    let leftOverAmount = new BigNumber(wantedAmount);

    // the orderBook is already ordered from the lowest asks to the highest, so the best matches are the first
    for (const [askPrice, askQty] of orderBook.asks) {
      const price = new BigNumber(askPrice);
      const qty = new BigNumber(askQty);
      if (qty.isGreaterThan(leftOverAmount)) {
        ordersForWantedAmount.push({
          orderPrice: price,
          filledAmount: leftOverAmount,
        });
        leftOverAmount = new BigNumber(0);
        break;
      }
      leftOverAmount = leftOverAmount.minus(qty);
      ordersForWantedAmount.push({
        orderPrice: price,
        filledAmount: qty,
      });
    }
    // this is to deal with edge case where the order book cannot fulfill the wantedAmount in its totality
    const totalFillableAmount = new BigNumber(wantedAmount).minus(
      leftOverAmount,
    );
    const finalAveragePrice = ordersForWantedAmount.reduce(
      (accPrice, order) => {
        const orderQtyWeightedPrice = order.filledAmount
          .dividedBy(totalFillableAmount)
          .multipliedBy(order.orderPrice);
        return accPrice.plus(orderQtyWeightedPrice);
      },
      new BigNumber(0),
    );

    return {
      btcAmount: totalFillableAmount.toNumber(),
      usdAmount: Number(finalAveragePrice.toFixed(2)),
    };
  }

  // Will get best execution price across supported exchanges with proper calculations
  async getBestBuyExecutionPrice(
    product: string,
    wantedAmount: number,
  ): Promise<BestPriceDto> {
    const bestPricePerExchange = await Promise.allSettled(
      this.exchangesProvider.map(async (provider) => {
        const orderBook = await provider.getOrderBook(product);
        return {
          exchange: provider.getExchangeName(),
          ...this.calculateBestBuyExecutionPrice(orderBook, wantedAmount),
        };
      }),
    );

    Logger.debug(JSON.stringify(bestPricePerExchange));
    const minTracker = {
      min: Number.POSITIVE_INFINITY,
      result: undefined,
    };

    // The criteria for choosing the exchange is based on price first, meaning even if the order is only
    // partially fulfilled on one exchange but completely fulfilled on another for a higher price,
    // we would prioritize the lower price/partial order fulfillment
    for (const settledResult of bestPricePerExchange) {
      if (settledResult.status === 'rejected') {
        continue;
      }
      const { usdAmount } = settledResult.value;
      if (usdAmount < minTracker.min) {
        minTracker.result = settledResult.value;
        minTracker.min = usdAmount;
      }
    }

    return minTracker.result;
  }
}
