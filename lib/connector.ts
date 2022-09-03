/* eslint-disable no-console */
import { serialize } from 'cookie';
import { nanoid } from 'nanoid';
import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector =() => nc<NextApiRequest, NextApiResponse>({
  onError: (err, _, res) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
  },
  onNoMatch: (_, res) => {
    res.status(404).json({ message: 'Not found' });
  },
}).use((req: NextApiRequest, res: NextApiResponse, next) => {
  if (!req.cookies.uid) {
    const uid = nanoid(24);

    res.setHeader('Set-Cookie', serialize('uid', uid, {
      httpOnly: true,
      sameSite: true
    }));

    req.cookies.uid = uid;
  }

  next();
});

export default connector;