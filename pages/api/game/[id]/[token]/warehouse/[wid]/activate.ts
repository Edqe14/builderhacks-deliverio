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

    const index = game.state.warehouses.available.findIndex((ret) => ret.id === req.query.wid);
    if (index === -1) {
      res.status(404).json({ message: 'Wholesale not found' });
      return;
    }

    const [warehouse] = game.state.warehouses.available.splice(index, 1);
    if (game.state.balance < warehouse.pricePerWeek) {
      res.status(403).json({ message: 'Not enough balance' });
      return;
    }

    game.state.balance -= warehouse.pricePerWeek;
    game.state.warehouses.active.push(warehouse);

    res.status(200).json({ message: 'Activated' });
  });