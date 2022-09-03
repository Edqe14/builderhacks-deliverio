import EventEmitter from 'events';
import { nanoid } from 'nanoid';

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
}

export default class Game extends EventEmitter {
  public readonly id = nanoid(32);

  public readonly host: string;

  public readonly players: string[] = [];

  public totalDays = 30;

  public difficulity = Difficulty.Easy;

  public dayDurationSeconds = 60;

  public enabledDepartments: Departments[] = ['retail', 'wholesale'];

  public completed = false;

  constructor({ host, players, dayDurationSeconds, difficulty, enabledDepartments, totalDays }: GameOptions) {
    super();

    this.host = host;
    this.players = players ?? [];
    this.dayDurationSeconds = dayDurationSeconds ?? 60;
    this.difficulity = difficulty ?? Difficulty.Easy;
    this.enabledDepartments = enabledDepartments ?? ['retail', 'wholesale'];
    this.totalDays = totalDays ?? 30;
  }
}