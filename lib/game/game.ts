import { ChannelType } from '@onehop/js';
import EventEmitter from 'events';
import { nanoid } from 'nanoid';
import gameStream from '../database';
import GameModel from '../database/models/game';
import hop from '../hop';
import Retail from './departments/retail';
import Wholesale from './departments/wholesale';
import Item from './common/item';
import Supplier, { SupplierRequest } from './departments/supplier';
import { clamp, prepareData, random } from '../helper';
import Warehouse from './departments/warehouse';

export const GAME_TICKS_PER_SECOND = 24;
export const GAME_TICKS = 1000 / GAME_TICKS_PER_SECOND;

export type Departments = 'retail' | 'wholesale';
export enum Difficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}

export interface GameOptions {
  host: string;
  players?: string[];
  totalDays?: number;
  dayDurationSeconds?: number;
  enabledDepartments?: Departments[];
  difficulty?: number;
  startingBalance?: number;
}

export interface Stock {
  itemId: string;
  amount: number;
}

export default class Game extends EventEmitter {
  public readonly id = nanoid(32);

  public readonly token = nanoid(8);

  public readonly host: string;

  public totalDays = 30;

  public difficulity = Difficulty.Easy;

  public dayDurationSeconds = 60;

  public startingBalance = 100_000;

  public enabledDepartments: Departments[] = ['retail', 'wholesale'];

  public timer: NodeJS.Timeout | null = null;

  public readonly channel = hop.channels.create(ChannelType.PRIVATE, this.id);

  public document = new GameModel({ id: this.id, token: this.token });

  public state = {
    host: '',
    balance: this.startingBalance,
    dayEnd: false,
    started: false,
    paused: false,
    completed: false,
    lose: false,
    maxTime: 0,
    time: 0,
    day: 0,
    score: 0,
    players: [] as string[],

    stats: {
      balance: [] as number[],
      utilizationPercent: [] as number[]
    },

    warehouses: {
      available: [
        new Warehouse(this, 'small'),
        new Warehouse(this, 'medium'),
        new Warehouse(this, 'large'),
        new Warehouse(this),
        new Warehouse(this),
      ] as Warehouse[],
      active: [] as Warehouse[]
    },
    departments: {
      retail: {
        available: [] as Retail[],
        active: [] as Retail[]
      },
      wholesale: {
        available: [] as Wholesale[],
        active: [] as Wholesale[]
      }
    },
    supplies: {
      queue: [] as SupplierRequest[],
      supplier: [] as Supplier[],
      availableSupplies: [
        new Item(this, 'Orange Juice', ''),
        new Item(this, 'Apple Juice', ''),
        new Item(this, 'Avocado Juice', ''),
      ] as Item[]
    }
  };

  constructor({ host, ...opts }: GameOptions) {
    super();

    this.host = host;
    this.state.host = host;

    this.init();
    this.updateSettings(opts);
  }

  getAvailableItemIndex(id: string) {
    const i = this.state.supplies.availableSupplies.findIndex((item) => item.id === id);
    if (i === -1) return null;

    return i;
  }

  getChannel() {
    return this.channel;
  }

  async init() {
    await this.document.save();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changeHandler = async (ev: any) => {
      if (ev.operationType !== 'modify') return;

      const current = await GameModel.findOne({ id: this.id });
      if (!current) return;

      this.document = current;
      if (this.state.players.join('-') !== current.players.join('-')) {
        this.state.players = current.players;
        await this.updateChannelState();
      }
    };

    gameStream.on('change', changeHandler);
    this.once('start', () => {
      gameStream.off('change', changeHandler);
    });
  }

  async updateChannelState(actuallyWait = false) {
    const res = (await this.getChannel()).patchState(prepareData(this.state));
    if (actuallyWait) await res;
  }

  async mergeState(state: ((state: typeof this.state) => Partial<typeof this.state>)) {
    this.state = { ...this.state, ...state(this.state) };

    await this.updateChannelState();
  }

  async updateSettings({ dayDurationSeconds, difficulty, enabledDepartments, totalDays, startingBalance, players }: Omit<GameOptions, 'host'>) {
    if (dayDurationSeconds !== undefined) this.dayDurationSeconds = dayDurationSeconds ?? 60;
    if (difficulty !== undefined) this.difficulity = difficulty ?? Difficulty.Easy;
    if (enabledDepartments !== undefined) this.enabledDepartments = enabledDepartments ?? ['retail', 'wholesale'];
    if (totalDays !== undefined) this.totalDays = totalDays ?? 30;
    if (startingBalance !== undefined) this.startingBalance = startingBalance ?? 100_000;

    if (players) {
      this.state.players = players ?? [];
      await this.document.update({ players: this.state.players });
    }

    this.state.maxTime = this.dayDurationSeconds * this.totalDays * 1000;

    await this.updateChannelState();
  }

  registerTimeout() {
    this.timer = setTimeout(async () => {
      if (this.state.completed || !this.state.started) return;
      if (this.state.paused) return this.registerTimeout();

      this.state.time += GAME_TICKS;
      this.emit('update', this.state.time);

      await this.update();
      await this.postUpdate();

      if (this.state.time >= this.state.maxTime) return this.stop();

      this.registerTimeout();
    }, GAME_TICKS);
  }

  async pregen() {
    this.state.supplies.supplier = new Array(random(3, 5))
      .fill(0)
      .map(() => new Supplier(this));

    this.state.departments.retail.available = new Array(random(5, 10))
      .fill(0)
      .map(() => new Retail(this));

    this.state.departments.wholesale.available = new Array(random(6, 10))
      .fill(0)
      .map(() => new Wholesale(this));

    await this.updateChannelState(true);
  }

  async start() {
    if (this.state.paused) {
      this.state.paused = false;
      return;
    }

    if (this.timer || this.state.started || this.state.completed) return;

    this.state.started = true;

    this.emit('start');

    await this.pregen();

    await this.update();
    await this.postUpdate();

    this.registerTimeout();

    return true;
  }

  async stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.state.completed = true;
    this.emit('stop');

    setTimeout(async () => {
      await Promise.all([
        hop.channels.delete(this.id),
        this.document.delete()
      ]);
    }, 5 * 60 * 1000);
  }

  getNetProfit(day = this.state.day) {
    return (this.state.stats.balance[day] ?? this.state.balance) - (this.state.stats.balance[clamp(day - 1, 0)] ?? this.startingBalance);
  }

  getCurrentStorageUsage() {
    const totalSupply = this.state.supplies.availableSupplies.reduce((acc, item) => acc + item.amount, 0);

    // 50 items = 1m^2
    return totalSupply / 50;
  }

  getUtilizationPercent() {
    const total = this.state.warehouses.active.length;

    return this.getCurrentStorageUsage() / total * 100;
  }

  getHighestUtilizationWarehouse() {
    const sorted = [...this.state.warehouses.active].sort((a, b) => b.getUtilizationPercent() - a.getUtilizationPercent())[0];
    if (!sorted) return null;

    return sorted;
  }

  runQueue() {
    // TRY FULLFIL WHOLESALERS FIRST
    this.state.departments.wholesale.active.forEach((wholesale, i) => {
      if (wholesale.check()) return;

      const index = this.getAvailableItemIndex(wholesale.data.itemId);
      if (!index) return;

      const item = this.state.supplies.availableSupplies[index];
      if (item.amount === 0) return;

      const amountLeft = wholesale.data.amount - wholesale.progress.amount;
      const possible = Math.min(amountLeft, item.amount);

      const highest = this.getHighestUtilizationWarehouse();
      if (!highest) return;

      const wIndex = this.state.warehouses.active.indexOf(highest);

      this.state.departments.wholesale.active[i].progress.amount += possible;
      this.state.supplies.availableSupplies[index].amount = clamp(this.state.supplies.availableSupplies[index].amount - amountLeft, 0);
      this.state.warehouses.active[wIndex].totalItems -= possible;
    });

    this.state.departments.wholesale.active = this.state.departments.wholesale.active.filter((w) => !w.check());

    // SUPPLY REQUEST FULLFIL
    this.state.supplies.queue.forEach((req) => {
      if (req.arriveTime >= this.state.time) {
        const index = this.getAvailableItemIndex(req.itemId);
        const wIndex = this.state.warehouses.active.findIndex((w) => w.id === req.warehouseId);
        if (!index || wIndex === -1) return;

        this.state.supplies.availableSupplies[index].amount += req.amount;
        this.state.warehouses.active[wIndex].totalItems += req.amount;
      }
    });

    this.state.supplies.queue = this.state.supplies.queue.filter((req) => req.arriveTime < this.state.time);
  }

  async update() {
    // DAY END
    if (Math.floor(this.state.time / 1000) % this.dayDurationSeconds === 0 && !this.state.dayEnd) {
      const utilPercent = this.getUtilizationPercent();

      await this.mergeState((state) => ({
        dayEnd: true,
        day: state.day + 1,
        stats: {
          balance: [...state.stats.balance, state.balance],
          utilizationPercent: [...state.stats.utilizationPercent, utilPercent]
        },
      }));

      this.emit('day', this.state.day);

      // UTILIZATION SCORE
      const utilizationScore = utilPercent >= 50 && utilPercent <= 100 ? 10 : -10;

      // PROFIT SCORE CALCULATION
      const pastNetProfit = this.getNetProfit(this.state.day - 1);
      const profitDiff = this.getNetProfit() - pastNetProfit;

      // RETAIL RESTOCK
      this.state.departments.retail.active.forEach((retail, i) => {
        const warehouse = this.getHighestUtilizationWarehouse();
        if (!warehouse) return;

        const index = this.getAvailableItemIndex(retail.data.itemId);
        if (!index) return;

        const supply = this.state.supplies.availableSupplies[index];
        if (supply.amount === 0) return;

        const diff = clamp(retail.data.amountPerDay - supply.amount, 0);
        this.state.supplies.availableSupplies[index].amount = clamp(supply.amount - retail.data.amountPerDay, 0);
        // eslint-disable-next-line no-param-reassign
        this.state.departments.retail.active[i].data.currentStock += retail.data.amountPerDay - diff;
      });

      // WAREHOUSE PAYMENT
      if (this.state.day % 7 === 0) {
        this.state.warehouses.active.forEach((warehouse) => {
          this.state.balance -= warehouse.pricePerWeek;
        });
      }

      // OVERFILL PENALTY
      this.state.warehouses.active.forEach((warehouse) => {
        if (warehouse.getUtilizationPercent() > 100) {
          this.state.balance -= warehouse.overfillPricePerDay;
        }
      });

      this.state.departments.wholesale.available.pop();
      this.state.departments.wholesale.available.unshift(
        new Wholesale(this),
        new Wholesale(this)
      );


      await this.mergeState((s) => ({
        score: s.score + clamp(Math.round(profitDiff / 2), -500, 500) + utilizationScore
      }));
    }

    if (Math.floor(this.state.time / 1000) % this.dayDurationSeconds !== 0 && this.state.dayEnd) {
      await this.mergeState(() => ({ dayEnd: false }));
    }

    this.state.departments.retail.active.forEach((retail) => {
      retail.decideBuy();
    });

    this.runQueue();

    // force update
    this.updateChannelState();
  }

  async postUpdate() {
    const channel = await this.getChannel();
    channel.setState(this.state);
  }
}