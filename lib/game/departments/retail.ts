import { random, clamp } from '@/lib/helper';
import Game from '../game';
import Base from './base';

export interface RetailItem {
  itemId: string;
  amountPerDay: number;
  pricePerItem: number;
  currentStock: number;
}
export default class Retail extends Base<RetailItem> {
  constructor(game: Game) {
    const randomItem = game.state.supplies.availableSupplies[random(0, game.state.supplies.availableSupplies.length)];

    super(game, {
      itemId: randomItem.id,
      amountPerDay: 1000,
      currentStock: 0,
      pricePerItem: 0
    });
  }

  decideBuy() {
    const totalPeople = 60 + Math.round(Math.random() * 20) - (this.game.difficulity * random(10, 15));

    for (let i = 0; i < totalPeople; i += 1) {
      const itemIndex = this.game.getAvailableItemIndex(this.data.itemId);
      if (!itemIndex) return;
      const itemSup = this.game.state.supplies.availableSupplies[itemIndex];

      const priceDiff = this.data.pricePerItem - (itemSup.basePrice ?? 1);
      const buyAmount = clamp(random(5, 10) - Math.round(priceDiff / 2), 0, Infinity);

      if (this.data.currentStock > 0 && buyAmount !== 0) {
        this.data.currentStock -= buyAmount;
        this.game.state.balance += buyAmount * this.data.pricePerItem;
        this.game.state.score = 0.5;
      }
    }
  }
}