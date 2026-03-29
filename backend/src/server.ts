import { Server, Origins } from 'boardgame.io/server';
import { TicTacToe } from './game';

const PORT = Number(process.env.PORT) || 8000;

const origins: (string | RegExp | boolean)[] = [
  Origins.LOCALHOST_IN_DEVELOPMENT,
];

const server = Server({
  games: [TicTacToe],
  origins,
});

server.run(PORT, () => {
  console.log(`boardgame.io server listening on port ${PORT}`);
});
