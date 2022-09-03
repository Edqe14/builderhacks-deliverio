/* eslint-disable import/first */
import { config } from 'dotenv';

config({
  path: '.env.local'
});

import express from 'express';
import { Server } from 'http';
import next from 'next';
import { GameStore } from './lib/game/store';
import { deleteChannel } from './lib/hop';


const app = express();
const server = new Server(app);

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const port = 3000;

const main = async () => {
  await nextApp.prepare();

  app.all('*', (req, res) => nextHandler(req, res));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://localhost:${port}`);
  });
};

main();

process.on('SIGINT', () => process.emit('beforeExit', 0));
process.once('beforeExit', async () => {
  await Promise.all(GameStore.all().map((g) => g.stop()));

  process.exit(0);
});