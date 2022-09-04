import connector from '@/lib/connector';
import { Departments } from '@/lib/game/game';
import { GameStore } from '@/lib/game/store';
import { prepareData, runValidator } from '@/lib/helper';
import gameValidator from '@/lib/validators/game';

export default connector()
  .get((req, res) => {
    const all = GameStore.all().filter((v) => v.host === req.cookies.uid);

    return res.json(prepareData({ data: all }));
  })
  .post(async (req, res) => {
    if (GameStore.all().some((g) => g.host === req.cookies.uid && !g.state.completed)) return res.status(403).json({ message: 'You already have a game' });

    if (!(await runValidator(res, gameValidator, req.body))) return;

    const { enabledDepartments, ...rest } = gameValidator.cast(req.body);
    const game = GameStore.create({
      host: req.cookies.uid,
      enabledDepartments: enabledDepartments as Departments[],
      ...rest
    });

    return res.json(prepareData({ data: { id: game.id, token: game.token, host: game.host } }));
  });