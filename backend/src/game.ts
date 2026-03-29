import { INVALID_MOVE } from 'boardgame.io/core';
import type { Game, PlayerID } from 'boardgame.io';

export type TicTacToeG = {
  cells: (PlayerID | null)[];
};

function isVictory(cells: (PlayerID | null)[]): boolean {
  const lines: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return lines.some((line) => {
    const [a, b, c] = line;
    const v = cells[a];
    return v != null && v === cells[b] && v === cells[c];
  });
}

function isDraw(cells: (PlayerID | null)[]): boolean {
  return cells.every((c) => c !== null);
}

export const TicTacToe: Game<TicTacToeG> = {
  name: 'tic-tac-toe',

  minPlayers: 2,
  maxPlayers: 2,

  setup: () => ({
    cells: Array(9).fill(null) as (PlayerID | null)[],
  }),

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  moves: {
    clickCell: ({ G, ctx, playerID }, id: number) => {
      if (ctx.currentPlayer !== playerID) {
        return INVALID_MOVE;
      }
      if (id < 0 || id > 8 || G.cells[id] !== null) {
        return INVALID_MOVE;
      }
      G.cells[id] = playerID;
      return;
    },
  },

  endIf: ({ G, ctx }) => {
    if (isVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (isDraw(G.cells)) {
      return { draw: true };
    }
    return;
  },
};
