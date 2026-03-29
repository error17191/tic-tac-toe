import type { BoardProps } from 'boardgame.io/react';
import type { TicTacToeG } from './game';

export function Board({
  G,
  ctx,
  moves,
  playerID,
  isActive,
  isConnected,
}: BoardProps<TicTacToeG>) {
  const gameover = ctx.gameover as
    | { winner?: string; draw?: boolean }
    | undefined;

  let status: string;
  if (gameover?.draw) {
    status = 'Draw.';
  } else if (gameover?.winner != null) {
    status =
      gameover.winner === playerID
        ? 'You win!'
        : `Player ${gameover.winner} wins.`;
  } else if (!isConnected) {
    status = 'Reconnecting to server…';
  } else if (ctx.currentPlayer === playerID) {
    status = 'Your turn';
  } else {
    status = `Waiting for player ${ctx.currentPlayer}…`;
  }

  const canPlay =
    isActive && isConnected && !gameover && ctx.currentPlayer === playerID;

  return (
    <div className="board-wrap">
      <p className="status" role="status">
        {status}
      </p>
      <p className="you-are">
        You are player <strong>{playerID}</strong> (
        {playerID === '0' ? 'X' : 'O'})
      </p>
      <table className="grid" aria-label="Tic-tac-toe board">
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr key={row}>
              {[0, 1, 2].map((col) => {
                const id = row * 3 + col;
                const mark = G.cells[id];
                const label = mark === '0' ? 'X' : mark === '1' ? 'O' : '';
                const empty = mark == null;
                return (
                  <td key={id}>
                    {empty ? (
                      <button
                        type="button"
                        className="cell"
                        disabled={!canPlay}
                        aria-label={`Cell ${id + 1}, empty`}
                        onClick={() => moves.clickCell(id)}
                      />
                    ) : (
                      <span className="cell filled" aria-label={`Cell ${id + 1}, ${label}`}>
                        {label}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
