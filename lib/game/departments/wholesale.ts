import Game from '../game';
import Base from './base';

interface RetailItem {
  itemId: string;
  amount: string;
};

export default class Retail extends Base<RetailItem[]> {
  public readonly price: number;

  public readonly deadline: number;

  public progress: RetailItem[];

  constructor(game: Game, { price, deadline }: Record<string, number>) {
    super(game, []);

    this.price = price;
    this.deadline = deadline;
    this.progress = [...this.data];
  }
}