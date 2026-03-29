# Multiplayer tic-tac-toe (boardgame.io)

Turn-based **3×3 tic-tac-toe** for two players, using **[boardgame.io](https://boardgame.io/)**: a **Node** game server (authoritative rules + Socket.IO) and a **React + Vite** web UI.

## Requirements

- **Node.js** 18+ (backend dev script uses `node --watch`)
- npm (or compatible client)

## Quick start

**1. Backend** — from the repo root:

```bash
cd backend
npm install
npm run dev
```

Leave this running. The server listens on **port 8000** by default (`PORT` env overrides). Check: [http://localhost:8000/games](http://localhost:8000/games) should list `tic-tac-toe`.

**2. Frontend** — second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

**3. Play** — open **two browser tabs** (or two browsers):

- Use the **same Match ID** (default `default` is fine).
- Tab A: **Player 0** (X). Tab B: **Player 1** (O).
- Click **Join game** in each tab and take turns on the board.

## Configuration

| What | Where |
|------|--------|
| Game server URL (frontend) | `frontend/.env` — copy from `frontend/.env.example`. Set `VITE_SERVER_URL` (no trailing slash), e.g. `http://localhost:8000`. If unset, the app uses `http://<your-hostname>:8000`. |
| Server port (backend) | `PORT` env, default `8000`. |
| Allowed browser origins (backend) | `backend/src/server.ts` — `Origins.LOCALHOST_IN_DEVELOPMENT` allows localhost on any port in development; add production URLs when you deploy. |

Real-time sync uses **Socket.IO** (WebSocket-oriented transport) between the UI and `backend`.

## Project layout

```
ticTacToe/
├── README.md                 ← this file
├── PLAN.md                   ← implementation plan
├── BOARDGAME_IO_FIT.md       ← how boardgame.io fits this repo
├── backend/                  ← boardgame.io Server (TypeScript → Node)
│   └── README.md
└── frontend/                 ← React + Vite client
    └── README.md
```

**Important:** `frontend/src/game.ts` and `backend/src/game.ts` define the same rules; keep them **in sync** when you change moves or win/draw logic (or extract a shared module later).

## Backend tests

```bash
cd backend
npm test
```

Tests use the boardgame.io **client** in **Local** mode (no network server required). See `backend/README.md`.

## Production notes

- Build the frontend: `cd frontend && npm run build` — static output in `frontend/dist/`.
- Build and run the backend: `cd backend && npm start` (runs `tsc` then `node dist/server.js`).
- Serve the SPA over **HTTPS** in production and point `VITE_SERVER_URL` at your public API URL; extend **`origins`** in `backend/src/server.ts` so only your real site can open Socket.IO connections.

## Further reading

- [boardgame.io documentation](https://boardgame.io/documentation/)
- `backend/README.md` — TypeScript build, tests, server layout
- `frontend/README.md` — Vite env and build
