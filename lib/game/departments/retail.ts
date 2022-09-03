import Game from '../game';
import Base from './base';

export interface RetailData {
  amountPerDay: number;
  pricePerItem: number;
}

type RetailItem = {
  itemId: string;
} & RetailData;

export default class Retail extends Base<RetailItem[]> {
  constructor(game: Game) {
    super(game, []);
  }
}