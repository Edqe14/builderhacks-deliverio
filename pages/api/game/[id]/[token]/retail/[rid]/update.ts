import connector from '@/lib/connector';
import { GameStore } from '@/lib/game/store';
import gameTokenMiddleware from '@/lib/middlewares/gameToken';

export default connector()
  .use(gameTokenMiddleware)
  .post((req, res) => {
    const { amountPerDay, pricePerItem } = req.body;
    if (!amountPerDay || !pricePerItem) {
      return res.status(400).json({ message: 'Invalid request' });
    }

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

    game.state.departments.retail.active[index].data.amountPerDay = amountPerDay;
    game.state.departments.retail.active[index].data.pricePerItem = pricePerItem;

    res.status(200).json({ message: 'Updated' });
  });