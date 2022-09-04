import { clamp } from '@/lib/helper';
import Game from '../game';
import Base from './base';

export const WAREHOUSE_PRESET = {
  small: {
    capacity: 100,
    pricePerWeek: 3_000,
    overfillPricePerDay: 500,
  },
  medium: {
    capacity: 300,
    pricePerWeek: 5_500,
    overfillPricePerDay: 1_000,
  },
  large: {
    capacity: 600,
    pricePerWeek: 10_000,
    overfillPricePerDay: 2_000
  }
};

const KEYS = Object.keys(WAREHOUSE_PRESET) as (keyof typeof WAREHOUSE_PRESET)[];

export default class Warehouse extends Base<null> {
  public readonly capacity: number;

  public readonly pricePerWeek: number;

  public readonly overfillPricePerDay: number;

  public totalItems = 0;

  constructor(game: Game, type?: keyof typeof WAREHOUSE_PRESET) {
    super(game, null);

    const typeData = WAREHOUSE_PRESET[type ?? KEYS[Math.floor(Math.random() * (KEYS.length - this.getDifficulityOffset()))]];
    const { capacity, pricePerWeek, overfillPricePerDay } = typeData;
    this.capacity = capacity;
    this.pricePerWeek = pricePerWeek;
    this.overfillPricePerDay = overfillPricePerDay;
  }

  getUtilizationPercent() {
    return this.getUtilization() / this.capacity * 100;
  }

  getUtilization() {
    return this.totalItems / 50;
  }

  getDifficulityOffset() {
    return clamp(this.game.difficulity * 0.45, 0.1);
  }
}