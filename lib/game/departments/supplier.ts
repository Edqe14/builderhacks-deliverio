import Game from '../game';
import Base from './base';

interface SupplierItem {
  itemId: string;
  pricePerItem: number;
  maxAmount: number;
};

export interface SupplierRequest {
  arriveTime: number;
  warehouseId: string;
  itemId: string;
  amount: number;
}

export default class Supplier extends Base<SupplierItem[]> {
  constructor(game: Game) {
    const randomItems = game.state.supplies.availableSupplies.filter(() => Math.random() > 0.5);

    super(game, []);

    this.data = randomItems.map((item) => ({
      itemId: item.id,
      pricePerItem: item.basePrice + Math.round(Math.random()) + Math.floor(this.getDifficulityOffset()),
      maxAmount: (Math.round(Math.random() * 12_000) + 8_000) - Math.floor(this.getDifficulityOffset() * 1500),
    }));
  }

  getDifficulityOffset() {
    return this.game.difficulity;
  }

  buyItem(id: string, amount: number, warehouse: string): SupplierRequest | null {
    const item = this.data.find((i) => i.itemId === id);
    if (!item) return null;

    const price = item.pricePerItem * amount;
    if (price > this.game.state.balance) return null;

    this.game.state.balance -= price;

    const request: SupplierRequest = {
      amount,
      itemId: id,
      warehouseId: warehouse,
      arriveTime: this.game.state.time + this.game.dayDurationSeconds * 1000,
    };

    this.game.state.supplies.queue.push(request);

    return request;
  }
}