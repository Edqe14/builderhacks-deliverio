import mongoose from 'mongoose';
import GameModel from './models/game';

mongoose
  // eslint-disable-next-line no-console
  .connect(process.env.MONGO_URI as string).then(() => console.log('Database connected'));

const gameStream = GameModel.watch();

export default gameStream;