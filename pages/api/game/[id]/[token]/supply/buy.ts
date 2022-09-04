import connector from '@/lib/connector';
import { GameStore } from '@/lib/game/store';
import gameTokenMiddleware from '@/lib/middlewares/gameToken';

export default connector()
  .use(gameTokenMiddleware)
  .post((req, res) => {
    const { supplierId, itemId, warehouseId, amount } = req.body;
    if (!supplierId || !itemId || !warehouseId || !amount) {
      res.status(400).json({ message: 'Invalid request' });
      return;
    }

    const game = GameStore.get(req.query.id as string);
    if (!game) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }

    const supplier = game.state.supplies.supplier.find((sup) => sup.id === supplierId);
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }

    const request = supplier.buyItem(itemId, amount, warehouseId);
    if (!request) {
      res.status(400).json({ message: 'Invalid request' });
      return;
    }

    res.status(200).json({ message: 'Request processed' });
  });