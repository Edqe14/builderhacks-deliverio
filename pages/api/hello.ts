// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { GameStore } from '@/lib/game/store';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const instance = GameStore.getInstance();
  console.log(instance.size);

  GameStore.create();

  res.status(200).json({ name: 'John Doe' });
}
