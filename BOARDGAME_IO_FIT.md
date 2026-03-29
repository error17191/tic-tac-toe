# How boardgame.io Fits This Project — Documentation Synthesis

This document summarizes what the [boardgame.io documentation](https://boardgame.io/documentation/) describes, how it maps to a **separate frontend + backend** multiplayer tic-tac-toe setup, and **which problems it solves** versus hand-rolling networking and state. It is based on the project’s published guides and API reference (including [`multiplayer.md`](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/multiplayer.md), [`api/Server.md`](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Server.md), [`api/Lobby.md`](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Lobby.md), [`concepts.md`](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/concepts.md), and related pages).

---

## 1. What boardgame.io is (core model)

The framework is built around a **declarative game object**: you implement **how state changes** when players act; the library turns that into a runnable game with **synchronized state** across clients and (in multiplayer) an **authoritative server**.

| Concept | Role |
|--------|------|
| **`G`** | Your game state. Must be **JSON-serializable** (no functions/classes in what you persist/sync). |
| **`ctx`** | Framework-managed metadata: turn, `currentPlayer`, `numPlayers`, phases, etc. You can rely on it instead of duplicating that in `G`. |
| **Moves** | Pure-ish functions that update `G` (and may use `events`, `random`, plugins). Dispatched as `client.moves.foo()` or React props. |
| **Events** | Framework actions on `ctx` (e.g. end turn, change phase), analogous to moves but for turn/phase flow. |
| **Phases / stages / turn order** | Optional structure for games more complex than tic-tac-toe: different allowed moves per phase, custom turn order, simultaneous steps, etc. |

**Multiplayer model ([multiplayer guide](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/multiplayer.md)):**

- **Clients** send moves/events; they can mirror rules locally for **optimistic updates** (responsive UI).
- A **game master** computes the **authoritative** next state. If the client’s prediction was wrong (e.g. secret state), the server state **wins**.
- **Local master** (`Local()`): in-browser sync — useful for hot-seat or prototyping without a server.
- **Remote master** (`SocketIO({ server })`): Node **Server** runs the master; clients connect over **Socket.IO** (WebSockets under the hood).

This directly supports your **backend = authority**, **frontend = UI + move dispatch** split.

---

## 2. How it fits the two-project layout

| Piece | boardgame.io role |
|--------|-------------------|
| **Backend** | Use `Server` from `boardgame.io/server` ([Server API](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Server.md)): Koa-based app, registers your **game definitions**, enforces **CORS `origins`**, optional **`db`** (default in-memory), optional **lobby** API port split. |
| **Frontend** | Use `Client` from `boardgame.io/client` or `boardgame.io/react` with `multiplayer: SocketIO({ server: '...' })`, plus `matchID`, `playerID`, and (with lobby) **`credentials`**. |
| **Shared logic** | The **same game object** (moves, `setup`, `endIf`, etc.) should drive both server registration and client instantiation so rules stay aligned ([Game API](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Game.md)). |

**Match instances:** clients default to match id `'default'`. For separate games, pass **`matchID`** (or `updateMatchID`) so only players in that room share state.

**Player seats:** each interactive client needs a **`playerID`** (`'0'`, `'1'`, …). Without it, the client is a **spectator** (see multiplayer docs).

---

## 3. Problems it fixes (why use it)

### 3.1 Networking and sync

**Without boardgame.io:** you design WebSocket messages, versioning, reconciliation, “who is allowed to move,” and broadcast rules yourself.

**With boardgame.io:** move dispatch, state broadcast, and **staying in sync** across tabs/clients are handled by the **remote master + Socket.IO transport**. The docs explicitly state you do **not** need to write the **networking or storage layer** yourself for the default path.

### 3.2 Cheating and authority

**Server-side execution** of game logic on the master means clients cannot be the sole source of truth for valid moves. Optimistic UI is an optimization; **authority remains on the server**.

### 3.3 Turn structure and game flow

**Turn order**, **min/max moves per turn**, **phases**, **stages**, and **events** (`endTurn`, `endPhase`, …) are first-class. For tic-tac-toe you may only need default round-robin + `maxMoves: 1`; the same framework scales if you later add menus, rematches, or variant rules.

### 3.4 Matchmaking and authenticated seats (optional but powerful)

The **Lobby REST API** ([Lobby API doc](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Lobby.md)) provides:

- **Create / join / leave** matches  
- **Player credentials** so moves on behalf of a seat require a token  
- **List games / matches**, **play again**, **update player metadata**  
- **`LobbyClient`** (fetch wrapper) and **React `<Lobby />`** for UI

**Problems this fixes:** ad-hoc “share this URL” flows work with raw `matchID`, but **lobby + credentials** address **seat hijacking** and **identity** for public deployments.

### 3.5 Persistence

Default storage is **in-memory**. The [storage guide](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/storage.md) documents **FlatFile** and community adapters (Firebase, Postgres, Azure, etc.) plus **custom** implementations of the storage interface.

**Problems this fixes:** refresh/reconnect behavior and **multi-instance hosting** need persistent `db`; otherwise you accept ephemeral matches.

### 3.6 Secret information (when you need it)

[`playerView`](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/secret-state.md) strips or reshapes `G` per player so hidden information is not sent to other clients. Moves can be marked **`client: false`** when the client cannot run them without secret data.

**Tic-tac-toe:** fully open board — you likely **do not** need this. It matters for future card/hidden-hand games.

### 3.7 Randomness done safely

Using **`random.*`** from the move context ([randomness guide](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/random.md)) keeps RNG **replayable** and **server-coherent**, avoiding `Math.random()` breaking purity/sync.

**Tic-tac-toe:** usually irrelevant unless you add random start player or variants.

### 3.8 Debugging and logs

Built-in **debug panel** (stripped in production unless configured), **game log**, optional **Redux** enhancers, and server **`DEBUG=*`** for Socket/Koa ([debugging guide](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/debugging.md)).

### 3.9 Extensibility

**Plugins** ([plugins guide](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/plugins.md)) add cross-cutting behavior (e.g. `PluginPlayer` for per-player records, custom APIs on `ctx`, validation hooks).

### 3.10 Chat (lightweight)

**`sendChatMessage` / `chatMessages`** exist for in-match messaging ([chat guide](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/chat.md)), but messages are **ephemeral** (not stored server-side; late joiners miss past messages).

---

## 4. Options you should know about (multiplayer “many options”)

1. **Local vs remote master** — prototype with `Local()`; ship online with `SocketIO()`.  
2. **`matchID`** — isolate games without a full lobby.  
3. **Lobby API** — create/join, credentials, listings, play-again.  
4. **`origins` / `apiOrigins`** — CORS for socket and REST ([Server API](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Server.md)).  
5. **`db`** — memory vs flat file vs external DB.  
6. **`generateCredentials` / `authenticateCredentials`** — custom auth (note doc caveat: some approaches may not match React lobby credential flow out of the box).  
7. **HTTPS / custom Koa routes** — extend the same server ([Server API usage](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Server.md)).  
8. **Phases / stages / turn order** — complexity when the game outgrows “one move per turn.”  
9. **Undo / delta state / TypeScript** — documented in sidebar ([undo](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/undo.md), [typescript](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/typescript.md), Game API `deltaState`).

The **marketing site** also lists **AI** among features; building strong bots typically means **search or policies against the same game rules** (sometimes with server-side `random` for determinism). Treat “bots” as an **integration pattern** on top of the engine, not a substitute for defining moves and state yourself.

---

## 5. What boardgame.io does *not* magically solve

| Gap | Implication for your app |
|-----|---------------------------|
| **Product UX** | Room codes, “copy link,” branding, loading/error UI — you still design these. |
| **Deployment** | You still deploy static frontend + Node server, TLS, and correct **public `origins`**. See [deployment guide](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/deployment.md). |
| **Account systems** | Lobby names/credentials are not a full user database unless you integrate one. |
| **Chat history** | Chat is ephemeral per docs. |
| **Non-turn-based genres** | Engine is aimed at **turn-based** games. |

---

## 6. Fit summary for multiplayer tic-tac-toe

| Need | boardgame.io answer |
|------|---------------------|
| Two players, one board, real-time updates | Remote master + `SocketIO`, shared `matchID`. |
| Valid moves only / no client-only truth | Moves run on server; optional optimistic client run. |
| Separate frontend and backend | Natural split: `Server({ games, origins })` vs `Client({ game, board, multiplayer })`. |
| Multiple concurrent games | Distinct `matchID` per game; optional lobby to create/list/join. |
| Survive refresh / scale server | Add a **storage adapter** when you outgrow in-memory. |
| Later: rematch, rooms, names | **Lobby** + `playAgain`, `matchData`, React `Lobby` component. |

---

## 7. Official references (for implementation detail)

- Concepts: [boardgame.io/documentation](https://boardgame.io/documentation/) (State, Moves, Events, Phase, Turn, Stage)  
- Multiplayer: [multiplayer.md](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/multiplayer.md)  
- Server: [api/Server.md](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Server.md)  
- Lobby: [api/Lobby.md](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Lobby.md)  
- Client: [api/Client.md](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Client.md)  
- Game: [api/Game.md](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/api/Game.md)  

When you move to implementation, align **package versions** and the **game `name`** across server and client; treat this file as the bridge between **documentation concepts** and your existing **[PLAN.md](./PLAN.md)** steps.
