import Game from '../game';

export default abstract class Transformer {
  abstract transform(game: Game): Promise<Game>;
}