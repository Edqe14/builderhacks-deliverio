import EventEmitter from 'events';
import Game, { GameOptions } from './game';

export class GameStore {
  public static instance: Map<string, Game> | null = null;

  public static emitter = new EventEmitter();

  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      this.instance = new Map<string, Game>();
    }

    return this.instance;
  }

  public static all() {
    return [...this.getInstance().values()];
  }

  public static get(id: string) {
    return this.getInstance().get(id);
  }

  public static create(opts: GameOptions) {
    const game = new Game(opts);

    this.getInstance().set(game.id, game);
    this.emitter.emit('create', game);

    return game;
  }
}

export default GameStore.getInstance();