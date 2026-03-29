import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { TicTacToe } from './game';

/** boardgame.io logs expected invalid / disallowed moves to console.error. */
describe('TicTacToe (boardgame.io)', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

function freshClient() {
  const client = Client({
    game: TicTacToe,
    numPlayers: 2,
  });
  client.start();
  return client;
}

function snapshotState(client: ReturnType<typeof Client>) {
  const s = client.getState();
  if (!s) {
    throw new Error('expected client state');
  }
  return JSON.stringify({ G: s.G, ctx: s.ctx });
}

describe('TicTacToe setup', () => {
  it('starts with nine empty cells', () => {
    const client = freshClient();
    const s = client.getState();
    expect(s).not.toBeNull();
    expect(s!.G.cells).toHaveLength(9);
    expect(s!.G.cells.every((c) => c === null)).toBe(true);
    expect(s!.ctx.currentPlayer).toBe('0');
  });
});

describe('TicTacToe moves (single client)', () => {
  it('alternates players after each valid move', () => {
    const client = freshClient();
    client.moves.clickCell(0);
    expect(client.getState()!.ctx.currentPlayer).toBe('1');
    client.moves.clickCell(1);
    expect(client.getState()!.ctx.currentPlayer).toBe('0');
    expect(client.getState()!.G.cells[0]).toBe('0');
    expect(client.getState()!.G.cells[1]).toBe('1');
  });

  it('rejects clicking an occupied cell', () => {
    const client = freshClient();
    client.moves.clickCell(4);
    const afterFirst = snapshotState(client);
    client.moves.clickCell(4);
    expect(snapshotState(client)).toBe(afterFirst);
  });

  it('rejects out-of-range cell indices', () => {
    const client = freshClient();
    const before = snapshotState(client);
    client.moves.clickCell(-1 as unknown as number);
    expect(snapshotState(client)).toBe(before);
    client.moves.clickCell(9 as unknown as number);
    expect(snapshotState(client)).toBe(before);
  });
});

describe('TicTacToe endIf', () => {
  it('declares a winner when a row is completed', () => {
    const game = {
      ...TicTacToe,
      setup: () => ({
        cells: ['0', '0', null, '1', '1', null, null, null, null] as (
          | string
          | null
        )[],
      }),
    };
    const client = Client({ game, numPlayers: 2 });
    client.start();
    client.moves.clickCell(2);
    expect(client.getState()!.ctx.gameover).toEqual({ winner: '0' });
  });

  it('declares a draw when the board is full with no winner', () => {
    const game = {
      ...TicTacToe,
      setup: () => ({
        cells: [
          '0',
          '0',
          '1',
          '1',
          '1',
          '0',
          '0',
          '1',
          null,
        ] as (string | null)[],
      }),
    };
    const client = Client({ game, numPlayers: 2 });
    client.start();
    client.moves.clickCell(8);
    expect(client.getState()!.ctx.gameover).toEqual({ draw: true });
  });
});

describe('TicTacToe Local multiplayer', () => {
  it('keeps two clients in sync', () => {
    const spec = {
      game: TicTacToe,
      multiplayer: Local(),
      numPlayers: 2,
    };
    const p0 = Client({ ...spec, playerID: '0' });
    const p1 = Client({ ...spec, playerID: '1' });
    p0.start();
    p1.start();

    p0.moves.clickCell(0);
    expect(p0.getState()!.G.cells[0]).toBe('0');
    expect(p1.getState()!.G.cells[0]).toBe('0');
    expect(p1.getState()!.ctx.currentPlayer).toBe('1');

    p1.moves.clickCell(4);
    expect(p0.getState()!.G.cells[4]).toBe('1');
  });

  it('rejects a move from the player whose turn it is not', () => {
    const spec = {
      game: TicTacToe,
      multiplayer: Local(),
      numPlayers: 2,
    };
    const p0 = Client({ ...spec, playerID: '0' });
    const p1 = Client({ ...spec, playerID: '1' });
    p0.start();
    p1.start();

    const before = snapshotState(p1);
    p1.moves.clickCell(0);
    expect(snapshotState(p1)).toBe(before);
  });
});

});
