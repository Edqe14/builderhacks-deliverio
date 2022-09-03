import connector from '@/lib/connector';
import { GameStore } from '@/lib/game/store';

export default connector()
  .post((req, res) => {
    const game = GameStore.get(req.query.id as string);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (req.cookies.uid !== game.host) {
      return res.status(403).json({ message: 'You are not the host' });
    }

    game.start();

    return res.json({ message: 'Started' });
  });