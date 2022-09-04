import connector from '@/lib/connector';
import { GameStore } from '@/lib/game/store';
import gameTokenMiddleware from '@/lib/middlewares/gameToken';

export default connector()
  .use(gameTokenMiddleware)
  .post((req, res) => {
    const game = GameStore.get(req.query.id as string);
    if (!game) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }

    const index = game.state.departments.retail.available.findIndex((ret) => ret.id === req.query.rid);
    if (index === -1) {
      res.status(404).json({ message: 'Retail not found' });
      return;
    }

    const splice = game.state.departments.retail.available.splice(index, 1);
    game.state.departments.retail.active.push(...splice);

    res.status(200).json({ message: 'Activated' });
  });