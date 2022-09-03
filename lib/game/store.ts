import Game from './game';

export class GameStore {
  public static instance: Map<string, Game> | null = null;

  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      this.instance = new Map<string, Game>();
    }

    return this.instance;
  }

  public static create() {
    const game = new Game();
    this.getInstance().set(game.id, game);

    return game;
  }
}

export default GameStore.getInstance();