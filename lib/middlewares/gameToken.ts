import { NextApiRequest, NextApiResponse } from 'next';
import { Middleware } from 'next-connect';
import { GameStore } from '../game/store';

const gameTokenMiddleware: Middleware<NextApiRequest, NextApiResponse> = (req, res, next) => {
  const { id, token } = req.query;
  if (!id || !token) {
    res.status(400).json({ message: 'Invalid request' });
    return;
  }

  const game = GameStore.get(id as string);
  if (!game) {
    res.status(404).json({ message: 'Game not found' });
    return;
  }

  if (game.token !== token) {
    res.status(403).json({ message: 'Invalid token' });
    return;
  }

  next();
};

export default gameTokenMiddleware;