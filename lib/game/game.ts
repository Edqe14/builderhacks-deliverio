import { ChannelType } from '@onehop/js';
import EventEmitter from 'events';
import { nanoid } from 'nanoid';
import hop from '../hop';

export const GAME_TICKS_PER_SECOND = 30;
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

export default class Game extends EventEmitter {
  public readonly id = nanoid(32);

  public readonly host: string;

  public readonly players: string[] = [];

  public totalDays = 30;

  public difficulity = Difficulty.Easy;

  public dayDurationSeconds = 60;

  public startingBalance = 100_000;

  public enabledDepartments: Departments[] = ['retail', 'wholesale'];

  public timer: NodeJS.Timeout | null = null;

  public readonly channel = hop.channels.create(ChannelType.PRIVATE, this.id);

  public state = {
    balance: this.startingBalance,
    started: false,
    paused: false,
    completed: false,
    maxTime: 0,
    time: 0,
    score: 0,
  };

  constructor({ host, players, ...opts }: GameOptions) {
    super();

    this.host = host;
    this.players = players ?? [];

    this.updateSettings(opts);
  }

  getChannel() {
    return this.channel;
  }

  async updateSettings({ dayDurationSeconds, difficulty, enabledDepartments, totalDays, startingBalance }: Omit<GameOptions, 'host' | 'players'>) {
    this.dayDurationSeconds = dayDurationSeconds ?? 60;
    this.difficulity = difficulty ?? Difficulty.Easy;
    this.enabledDepartments = enabledDepartments ?? ['retail', 'wholesale'];
    this.totalDays = totalDays ?? 30;
    this.startingBalance = startingBalance ?? 100_000;

    this.state.maxTime = this.dayDurationSeconds * this.totalDays * 1000;

    await (await this.getChannel()).patchState(this.state);
  }

  registerTimeout() {
    this.timer = setTimeout(async () => {
      if (this.state.completed || !this.state.started) return;
      if (this.state.paused) return this.registerTimeout();

      console.time('start');

      this.state.time += GAME_TICKS;
      this.emit('update', this.state.time);

      await this.update();
      await this.postUpdate();

      console.timeEnd('start');

      if (this.state.time >= this.state.maxTime) return this.stop();

      this.registerTimeout();
    }, GAME_TICKS);
  }

  async start() {
    if (this.state.paused) {
      this.state.paused = false;
      return;
    }

    if (this.timer || this.state.started || this.state.completed) return;

    this.state.started = true;

    this.emit('start');

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
  }

  async update() {
    // console.log(`${this.id} | time: ${this.state.time} | max: ${this.state.maxTime}`);
  }

  async postUpdate() {
    (await this.getChannel()).patchState(this.state);
  }
}