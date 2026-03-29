# Tic-tac-toe backend (boardgame.io + TypeScript)

## Stack

- **TypeScript** (~5.6) compiling to **CommonJS** in `dist/` (matches `boardgame.io/server`’s Node resolution).
- **`npm run dev`** runs **`tsc -w`** and **`node --watch dist/server.js`** via **`concurrently`** (avoid **`tsx`** here: it can break **Koa** / **boardgame.io** on Node 22).

## Setup

```bash
npm install
```

## Tests

```bash
npm test
npm run test:watch
```

Uses **Jest** + **ts-jest** against `boardgame.io/client` (scenario tests and **Local** multiplayer), following the [boardgame.io testing guide](https://boardgame.io/documentation/#/testing).

## Run

**Development** (restarts on file changes):

```bash
npm run dev
```

**Production-style** (compile then run):

```bash
npm start
```

(`prestart` runs `npm run build` first.)

Default port: **8000**. Override with `PORT`:

```bash
PORT=9000 npm start
```

## Project layout

| Path | Role |
|------|------|
| `src/game.ts` | `Game<TicTacToeG>` — `setup`, `moves`, `endIf`, etc. |
| `src/server.ts` | `Server({ games, origins })` |
| `dist/` | emitted JS (from `tsc`; ignored in git) |

## API checks

- `GET http://localhost:8000/games` → `["tic-tac-toe"]`

## boardgame.io version

Same **`boardgame.io`** version as the frontend when you add it.

## Types

`Game` and `PlayerID` come from **`boardgame.io`**; `INVALID_MOVE` from **`boardgame.io/core`**.
