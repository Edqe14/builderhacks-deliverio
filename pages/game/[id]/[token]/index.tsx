import { serialize } from 'cookie';
import { nanoid } from 'nanoid';
import { GetServerSideProps } from 'next';
import hop from '@/lib/hop';
import GameModel from '@/lib/database/models/game';

interface Props {
  gameFull?: boolean;
  channelToken?: string;
  id?: string;
}

export default function Game({ gameFull, channelToken, id }: Props) {
  return (
    <div>
      <h1>Game</h1>
      <p>{channelToken}</p>
      <p>{id}</p>
      <p>{gameFull ?? false}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, res } = ctx;

  if (!req.cookies.uid) {
    const uid = nanoid(24);

    res.setHeader('Set-Cookie', serialize('uid', uid, {
      httpOnly: true,
      sameSite: true
    }));

    req.cookies.uid = uid;
  }

  const { uid } = req.cookies;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const game = await GameModel.findOne({ id: ctx.params!.id });
  if (!game || game.token !== ctx.query.token) {
    return {
      notFound: true
    };
  }

  if (game.players.length + 1 >= 4 && !game.players.includes(uid)) {
    return {
      props: {
        gameFull: true
      }
    };
  }

  if (!game.players.includes(uid)) {
    game.players.push(uid);
    game.markModified('players');
    await game.save();
  }

  const { id } = await hop.channels.tokens.create();

  await hop.channels.subscribeToken(game.id, id);

  return {
    props: {
      channelToken: id,
      id: game.id
    }
  };
};