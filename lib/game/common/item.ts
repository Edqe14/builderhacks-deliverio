import { nanoid } from 'nanoid';
import Game from '../game';

export default class Item {
  public readonly id = nanoid(10);

  public readonly name: string;

  public readonly image: string;

  public readonly basePrice = 1;

  public readonly game: Game;

  public amount = 0;

  constructor(game: Game, name: string, image: string) {
    this.game = game;
    this.name = name;
    this.image = image;
    this.basePrice += game.difficulity;
  }
}