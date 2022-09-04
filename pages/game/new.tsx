import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CreateGame() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const game = await axios.post('/api/game', {}).catch(() => null);
      if (!game) return;

      router.push(`/game/${game.data.data.id}/${game.data.data.token}`);
    })();
  },[]);

  return <h1>Creating</h1>;
}