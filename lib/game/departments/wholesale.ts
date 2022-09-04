import { random } from '@/lib/helper';
import Game from '../game';
import Base from './base';

interface WholesaleItem {
  itemId: string;
  amount: number;
};

export default class Wholesale extends Base<WholesaleItem> {
  public readonly price: number;

  public readonly deadline: number;

  public progress: WholesaleItem;

  public completed = false;

  constructor(game: Game) {
    const randomItem = game.state.supplies.availableSupplies[random(0, game.state.supplies.availableSupplies.length)];

    super(game, {
      itemId: randomItem.id,
      amount: random(200, 5_000) + Math.floor(game.difficulity * 500),
    });

    this.price = this.data.amount * (randomItem.basePrice + 1 + Math.floor((2 - game.difficulity) * 2));
    this.deadline = game.state.time + (game.dayDurationSeconds * (7 - game.difficulity) * 1000);
    this.progress = { ...this.data };
  }

  check() {
    if (this.completed) return true;
    if (this.data.amount === this.progress.amount) {
      this.completed = true;

      return true;
    }

    return false;
  }
}