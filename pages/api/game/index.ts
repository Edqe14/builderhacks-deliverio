import connector from '@/lib/connector';
import { GameStore } from '@/lib/game/store';

export default connector()
  .get((req, res) => {
    const all = GameStore.all().filter((v) => v.host === req.cookies.uid);

    return res.json({ data: all });
  })
  .post((req, res) => {
    if (GameStore.all().some((g) => g.host === req.cookies.uid && !g.completed)) return res.status(403).json({ message: 'You already have a game' });

    const game = GameStore.create({
      host: req.cookies.uid,
    });

    return res.json({ data: game });
  });