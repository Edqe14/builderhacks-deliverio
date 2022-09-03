import { nanoid } from 'nanoid';

export default class Item {
  public readonly id = nanoid(10);

  public readonly name: string;

  public readonly image: string;

  constructor(name: string, image: string) {
    this.name = name;
    this.image = image;
  }
}