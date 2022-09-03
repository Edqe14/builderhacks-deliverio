import { serialize } from 'cookie';
import { nanoid } from 'nanoid';
import { GetServerSideProps } from 'next';
import hop from '@/lib/hop';
import { GameStore } from '@/lib/game/store';

export default function Game() {
  return (
    <div>
      <h1>Game</h1>
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

  const game = GameStore.get(ctx.query.id as string);
  if (!game || game.token !== ctx.query.token) {
    return {
      notFound: true
    };
  }

  if (game.state.players.length + 1 >= 4) {
    return {
      props: {
        gameFull: true
      }
    };
  }

  await game.updateSettings({
    players: [...game.state.players, uid]
  });

  const channel = await game.getChannel();
  const { id } = await hop.channels.tokens.create(channel.state);

  await channel.subscribeToken(id);

  return {
    props: {
      token: id,
      id: game.id
    }
  };
};