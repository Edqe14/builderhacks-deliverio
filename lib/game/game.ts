import { nanoid } from 'nanoid';

export default class Game {
  public readonly id = nanoid(32);
}