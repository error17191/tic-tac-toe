import { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { TicTacToe } from './game';
import { Board } from './Board';
import './App.css';

function gameServerUrl(): string {
  const envUrl = import.meta.env.VITE_SERVER_URL;
  if (envUrl != null && String(envUrl).trim() !== '') {
    return String(envUrl).replace(/\/$/, '');
  }
  return `http://${window.location.hostname}:8000`;
}

function Loading() {
  return (
    <div className="panel">
      <p className="muted">Connecting to game server…</p>
    </div>
  );
}

const TicTacToeClient = Client({
  game: TicTacToe,
  board: Board,
  numPlayers: 2,
  multiplayer: SocketIO({ server: gameServerUrl() }),
  loading: Loading,
  debug: import.meta.env.DEV,
});

export default function App() {
  const [joined, setJoined] = useState(false);
  const [matchID, setMatchID] = useState('default');
  const [playerID, setPlayerID] = useState<'0' | '1'>('0');

  if (!joined) {
    return (
      <div className="app">
        <header className="header">
          <h1>Tic-tac-toe</h1>
          <p className="muted">
            Run the backend on port 8000, then join the same match from two
            browser tabs with different players.
          </p>
        </header>
        <form
          className="panel join-form"
          onSubmit={(e) => {
            e.preventDefault();
            setJoined(true);
          }}
        >
          <label className="field">
            <span>Match ID</span>
            <input
              value={matchID}
              onChange={(e) => setMatchID(e.target.value)}
              placeholder="default"
              autoComplete="off"
            />
          </label>
          <fieldset className="field">
            <legend>Play as</legend>
            <label className="radio">
              <input
                type="radio"
                name="seat"
                checked={playerID === '0'}
                onChange={() => setPlayerID('0')}
              />
              Player 0 (X)
            </label>
            <label className="radio">
              <input
                type="radio"
                name="seat"
                checked={playerID === '1'}
                onChange={() => setPlayerID('1')}
              />
              Player 1 (O)
            </label>
          </fieldset>
          <button type="submit" className="primary">
            Join game
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Tic-tac-toe</h1>
        <p className="muted">
          Match <code>{matchID}</code> · You are player {playerID}
        </p>
        <button
          type="button"
          className="linkish"
          onClick={() => setJoined(false)}
        >
          Leave
        </button>
      </header>
      <TicTacToeClient matchID={matchID} playerID={playerID} />
    </div>
  );
}
