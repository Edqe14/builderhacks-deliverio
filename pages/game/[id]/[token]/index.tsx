import { serialize } from 'cookie';
import { nanoid } from 'nanoid';
import { GetServerSideProps } from 'next';
import { useEffect } from 'react';
import { hop } from '@onehop/client';
import { useReadChannelState } from '@onehop/react';
import hopServer from '@/lib/hop';
import GameModel from '@/lib/database/models/game';
import Game from '@/lib/game/game';

interface Props {
  gameFull?: boolean;
  channelToken?: string;
  id?: string;
}

export default function GameView({ gameFull, channelToken, id }: Props) {
  const { state } = useReadChannelState<Game['state']>(id as string);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    hop.init({
      projectId: process.env.NEXT_PUBLIC_HOP_PROJECT_ID as string, // replace with your project ID
      token: channelToken,
    });
  }, []);

  return (
    <div>
      <h1>Game</h1>
      <p>{channelToken}</p>
      <p>{id}</p>
      <p>{gameFull ?? false}</p>
      <br />
      <p>{state?.balance}</p>
      <p>{Math.floor((state?.time ?? 0) / 1000)}</p>
      <br />
      <p>{JSON.stringify(state?.warehouses)}</p>
      <br />
      <p>{JSON.stringify(state?.supplies)}</p>
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

  const { id } = await hopServer.channels.tokens.create();

  await hopServer.channels.subscribeToken(game.id, id);

  return {
    props: {
      channelToken: id,
      id: game.id
    }
  };
};