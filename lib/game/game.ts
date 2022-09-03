import { ChannelType } from '@onehop/js';
import EventEmitter from 'events';
import { nanoid } from 'nanoid';
import gameStream from '../database';
import GameModel from '../database/models/game';
import hop, { deleteChannel } from '../hop';

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
    balance: this.startingBalance,
    started: false,
    paused: false,
    completed: false,
    maxTime: 0,
    time: 0,
    score: 0,
    players: [] as string[],
  };

  constructor({ host, ...opts }: GameOptions) {
    super();

    this.host = host;

    this.init();
    this.updateSettings(opts);
  }

  getChannel() {
    return this.channel;
  }

  async init() {
    await this.document.save();

    gameStream.on('change', async (ev) => {
      if (ev.operationType !== 'modify') return;

      const current = await GameModel.findOne({ id: this.id });
      if (!current) return;

      this.document = current;
      if (this.state.players.join('-') !== current.players.join('-')) {
        this.state.players = current.players;
        await (await this.getChannel()).patchState(this.state);
      }
    });
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

    await (await this.getChannel()).patchState(this.state);
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

    await Promise.all([
      deleteChannel(this.id),
      this.document.delete()
    ]);
  }

  async update() {
    // console.log(`${this.id} | time: ${this.state.time} | max: ${this.state.maxTime}`);
  }

  async postUpdate() {
    const channel = await this.getChannel();
    channel.setState(this.state);
  }
}