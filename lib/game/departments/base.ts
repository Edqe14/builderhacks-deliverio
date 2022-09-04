import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';
import Game from '../game';

export default class Base<T> {
  public readonly id = nanoid(12);

  public readonly name = faker.company.name();

  public readonly address = faker.address.streetAddress(true);

  public readonly game: Game;

  public data: T;

  constructor(game: Game, data: T) {
    this.game = game;
    this.data = data;
  }
}