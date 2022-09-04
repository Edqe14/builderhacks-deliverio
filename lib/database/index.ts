import mongoose from 'mongoose';
import GameModel from './models/game';

setTimeout(() => {
  mongoose
    .connect(`mongodb://${process.env.NODE_ENV === 'development' ? 'localhost' : 'mongodb.hop'}:27017/deliverio`)
    // eslint-disable-next-line no-console
    .then(() => console.log('> Database connected'));
  // help me
}, 200);

const gameStream = GameModel.watch();

export default gameStream;