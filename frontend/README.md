# Tic-tac-toe frontend (React + Vite + boardgame.io)

## Prerequisites

- Backend running (see `../backend/README.md`), default **http://localhost:8000**
- **`boardgame.io`** version should match the backend (**0.50.x**)

## Setup

```bash
npm install
```

Optional: copy `.env.example` to `.env` and set `VITE_SERVER_URL` if the API is not on the same host with port `8000`.

## Run

```bash
npm run dev
```

Open two browser tabs, same **Match ID**, choose **Player 0** in one and **Player 1** in the other.

## Build

```bash
npm run build
```

Serve the static files from any host that can reach your game server, and allow that origin in the backend `origins` list.

## Game rules source

`src/game.ts` must stay aligned with `backend/src/game.ts`.
