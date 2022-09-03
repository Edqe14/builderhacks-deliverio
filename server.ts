import express from 'express';
import { Server } from 'http';
import next from 'next';
import { parse } from 'url';

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