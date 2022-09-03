import { Model, model, models, Schema } from 'mongoose';

interface SimpleGame {
  id: string;
  token: string;
  players: string[];
}

const GameSchema = new Schema<SimpleGame>({
  id: {
    required: true,
    type: String
  },
  token: {
    required: true,
    type: String
  },
  players: {
    type: Schema.Types.Mixed,
    default: () => []
  }
});

const GameModel = !models.game ? model('game', GameSchema) : models.game as Model<SimpleGame>;

export default GameModel;