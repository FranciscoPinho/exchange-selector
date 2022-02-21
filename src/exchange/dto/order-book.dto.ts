export class OrderBookDto {
  lastUpdateId?: number;
  sequence?: number;
  bids: [string, string][];
  asks: [string, string][];
}
