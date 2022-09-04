import mongoose from 'mongoose';
import GameModel from './models/game';

mongoose
  // eslint-disable-next-line no-console
  .connect(`mongodb://${process.env.NODE_ENV === 'development' ? 'localhost' : 'mongodb.hop'}:27017/deliverio`).then(() => console.log('Database connected'));

const gameStream = GameModel.watch();

export default gameStream;