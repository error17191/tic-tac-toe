# Backend checklist — boardgame.io tic-tac-toe

Work through these in order. Check boxes as you complete each item.

## Project setup

- [x] **1.1** Create `backend/package.json` with scripts: `build` (`tsc`), `start` (`node dist/server.js` + `prestart` build), `dev` (`concurrently` + `tsc -w` + `node --watch dist/server.js`).  
  _**TypeScript** compiles to **CommonJS** so `boardgame.io/server` resolves like the official Node examples._
- [x] **1.2** Install **`boardgame.io`** (^0.50.2), **`typescript`** (~5.6), **`concurrently`**, **`@types/node`**; use the **same** `boardgame.io` version in the frontend later.
- [x] **1.3** Add `tsconfig.json`, `src/game.ts`, `src/server.ts`, `.gitignore` (`dist/`, `node_modules/`).

## Game definition (`src/game.ts`)

- [x] **2.1** Export a game object with **`name`**: `'tic-tac-toe'`.
- [x] **2.2** **`setup`**: initial **`G`** — `cells: Array(9).fill(null)`.
- [x] **2.3** **`minPlayers` / `maxPlayers`**: both `2`.
- [x] **2.4** **`turn`**: `{ minMoves: 1, maxMoves: 1 }`.
- [x] **2.5** **`moves.clickCell`**: empty cell + **`playerID === ctx.currentPlayer`**; else **`INVALID_MOVE`**.
- [x] **2.6** **`endIf`**: win → `{ winner: ctx.currentPlayer }`; draw → `{ draw: true }`.
- [ ] **2.7** (Optional) **`ai.enumerate`** for debug-panel bots — skip for now.

## Server (`src/server.ts`)

- [x] **3.1** Import **`Server`**, **`Origins`** from `boardgame.io/server`.
- [x] **3.2** **`Server({ games: [TicTacToe], origins })`** with **`Origins.LOCALHOST_IN_DEVELOPMENT`** (+ production URL when deployed).
- [x] **3.3** **`server.run(port)`** with **`process.env.PORT ?? 8000`**.
- [x] **3.4** Log when listening (via `run` callback).

## Verify

- [x] **4.1** **`npm run dev`** or **`npm start`** — no startup errors.
- [x] **4.2** **`curl http://localhost:8000/games`** → `["tic-tac-toe"]`.
- [x] **4.3** **`README.md`** — install, scripts, port, origins note.

## Tests

- [x] **5.1** **Jest** + **ts-jest**, `src/game.test.ts` — setup, valid/invalid moves, win/draw scenarios, **Local()** sync + wrong-player rejection.
- [x] **5.2** **`tsconfig.build.json`** excludes tests from **`npm run build`** output.

---

## Progress log (optional)

| Date       | Note                                      |
|------------|-------------------------------------------|
| 2026-03-29 | Initial backend: game + server, CJS, port 8000 |
| 2026-03-29 | Migrated to **TypeScript** (`src/*.ts`, `tsc` → `dist/`, `tsx` for dev) |

**Next:** frontend **`Client`** + **`SocketIO`**, same **`TicTacToe`** rules (copy `game.js` or introduce `shared/`).
