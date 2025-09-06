# GameZ API Reference

## Core Classes

### GameService&lt;T extends string = string&gt;

The primary class for managing game sessions, state, and events.

#### Constructor

```typescript
constructor(
  name: T,
  levels: any[],
  assets: Record<string, string> = {}
)
```

**Parameters:**

- `name`: Unique identifier for the game service
- `levels`: Array of level configurations
- `assets`: Object mapping asset names to file paths

#### Properties

| Property         | Type                     | Description                                |
| ---------------- | ------------------------ | ------------------------------------------ |
| `name`           | `T`                      | Game service identifier                    |
| `levels`         | `any[]`                  | Array of level configurations              |
| `assets`         | `Record<string, string>` | Proxied asset object with preload warnings |
| `data`           | `Record<string, any>`    | Arbitrary storage for game-specific data   |
| `assetsBasePath` | `string`                 | Base path prepended to asset URLs          |

#### Session Management

##### `startSession(): void`

Transitions from `initialized` to `active` state. Must be called from `initialized` state.

**Events Emitted:**

- `GameEvents.SESSION_ACTIVE`

**Example:**

```typescript
gs.startSession();
```

##### `pauseSession(): void`

Pauses the current session. Can be called from `active` state.

**Events Emitted:**

- `GameEvents.SESSION_PAUSE`

##### `resumeSession(): void`

Resumes a paused session. Transitions from `paused` to `active`.

**Events Emitted:**

- `GameEvents.SESSION_ACTIVE`

##### `endSession(result: Exclude<ResultType, "">): void`

Ends the current session with a specific result.

**Parameters:**

- `result`: One of `"success"`, `"error"`, or `"timeout"`

**Events Emitted:**

- `GameEvents.SESSION_END`
- `GameEvents.RESULT_SUCCESS` | `GameEvents.RESULT_ERROR` | `GameEvents.RESULT_TIMEOUT`

##### `resetSession(): void`

Resets session to initial state and removes all event listeners.

**Warning:** This removes ALL event listeners. Re-register any permanent listeners after reset.

#### State Management

##### `initState(state: GameState): void`

Initialize the game state with default values.

**Parameters:**

- `state`: Initial state object

**Events Emitted:**

- `GameEvents.STATE_INIT`

##### `updateState(state: Partial<GameState>): void`

Merge new state with existing state using spread operator pattern.

**Parameters:**

- `state`: Partial state updates to merge

**Events Emitted:**

- `GameEvents.STATE_UPDATE`

##### `getState(): GameState`

Returns current state object. Direct mutations will not trigger events.

##### `useGameState(): GameState`

React hook for subscribing to state changes. Re-renders component on state updates.

**Example:**

```typescript
function GameComponent() {
  const state = gs.useGameState();
  return <div>Score: {state.score}</div>;
}
```

#### Asset Management

##### `async preloadAssets(partialAssets?: Record<string, string>): Promise<void>`

Preloads assets and converts them to blob URLs for optimal performance.

**Parameters:**

- `partialAssets`: Optional subset of assets to preload. Defaults to all assets.

**Returns:** Promise that resolves when all asset loading attempts complete.

**Behavior:**

- Uses `Promise.allSettled` for non-blocking parallel loading
- Failed loads generate warnings but don't throw errors
- Converts successful loads to blob URLs
- Updates asset proxy with new blob URLs

**Example:**

```typescript
await gs.preloadAssets();
// or preload specific assets
await gs.preloadAssets({ background: "/images/bg.png" });
```

#### Level Management

##### `getCurrLevel(): number`

Returns the current level index (0-based).

##### `getCurrLevelDetails<T>(): T`

Returns the current level configuration cast to type T.

**Generic Type Parameter:**

- `T`: Expected type of level configuration

**Example:**

```typescript
interface LevelConfig {
  lives: number;
  timeLimit: number;
  difficulty: string;
}

const level = gs.getCurrLevelDetails<LevelConfig>();
console.log(level.lives); // Type-safe access
```

##### `nextLevel(): void`

Advances to the next level. No bounds checking - use `isGameComplete()` first.

##### `setCurrLevel(level: number): void`

Sets the current level index directly.

**Parameters:**

- `level`: Target level index

##### `isGameComplete(): boolean`

Checks if all levels have been completed.

**Returns:** `true` if current level >= levels.length

#### Event System

##### `addSessionListener(fn: ListenerFn): Listener`

Subscribe to session change events.

**Parameters:**

- `fn`: Callback function for session events

**Returns:** Listener object with `off()` method for cleanup

##### `addStateListener(fn: ListenerFn): Listener`

Subscribe to state change events.

##### `addResultListener(fn: ListenerFn): Listener`

Subscribe to result change events.

##### `addSessionEndListner(fn: (result: ResultType) => void): void`

Subscribe to session end events with typed callback.

**Note:** Method name contains typo "Listner" - maintained for backward compatibility.

#### React Hooks

##### `useSession(): string`

React hook for subscribing to session state changes.

**Returns:** Current session state: `"initialized"`, `"active"`, `"paused"`, or `"end"`

##### `useResult(): ResultType`

React hook for subscribing to result changes.

**Returns:** Current result: `""`, `"success"`, `"error"`, or `"timeout"`

#### Reporting System

##### `reportUpdater(fn: (report: any) => any): Listener`

Register a function to contribute to report collection.

**Parameters:**

- `fn`: Function that receives current report and returns updates

**Returns:** Listener object with `off()` method

**Pattern:** Multiple updaters are chained, with each receiving the accumulated report.

**Example:**

```typescript
gs.reportUpdater(() => ({ score: getScore() }));
gs.reportUpdater((report) => ({
  ...report,
  rating: calculateRating(report.score),
}));
```

##### `collectReport(initialReport = {}): any`

Triggers report collection from all registered updaters.

**Parameters:**

- `initialReport`: Starting report object

**Returns:** Accumulated report after all updaters

**Constraint:** Can only be called when session state is `"end"`

##### `saveReport(report: any): void`

Saves a report to the reports history.

##### `getReports(): object[]`

Returns array of all saved reports.

#### Event Tracking

##### `track(event: string, metadata: any = {}): void`

Records an event with timestamp and metadata.

**Parameters:**

- `event`: Event name/identifier
- `metadata`: Additional data to attach

**Data Structure:**

```typescript
{
  event: string;
  metadata: any;
  time: number; // Seconds since session start
}
```

##### `getEvents(): any[]`

Returns array of all tracked events for the current session.

### GameManager&lt;T extends string = string&gt;

Orchestrates multiple GameService instances.

#### Constructor

```typescript
constructor();
```

#### Methods

##### `addGame(game: GameService<T>): void`

Registers a GameService instance.

##### `getGame(name: T): GameService`

Retrieves a registered GameService by name.

**Throws:** Error if game is not found

##### `getAllGames(): GameService[]`

Returns array of all registered GameService instances.

##### `removeGameService(name: T): void`

Unregisters a GameService by name.

##### `preloadGamesAssets(): Promise<SettledResult[]>`

Preloads assets for all registered games in parallel.

##### `getReports(): Record<T, any>`

Collects reports from all registered games.

## Event Types

### GameEvents Enum

```typescript
enum GameEvents {
  SESSION = "session.**",
  SESSION_ACTIVE = "session.active",
  SESSION_PAUSE = "session.pause",
  SESSION_END = "session.end",
  STATE = "state.**",
  STATE_INIT = "state.init",
  STATE_UPDATE = "state.update",
  REPORT = "report.**",
  REPORT_UPDATE = "report.update",
  RESULT = "result.**",
  RESULT_SUCCESS = "result.success",
  RESULT_ERROR = "result.error",
  RESULT_TIMEOUT = "result.timeout",
}
```

## Type Definitions

### ResultType

```typescript
type ResultType = "" | "success" | "error" | "timeout";
```

### GameState

```typescript
type GameState = Record<string, any>;
```

### LanguageType

```typescript
type LanguageType = "ENGLISH" | "TAGALOG" | "THAI" | "VIET" | "BAHASA";
```

## Advanced Usage Patterns

### Error Handling with Session Reset

```typescript
try {
  gs.startSession();
  // game logic
} catch (error) {
  console.error("Game error:", error);
  gs.resetSession();
  // Reinitialize any permanent listeners
  gs.addSessionEndListner(handleGameEnd);
}
```

### Conditional Asset Loading

```typescript
const criticalAssets = { background: "/bg.png" };
const optionalAssets = { music: "/music.mp3" };

// Load critical assets first
await gs.preloadAssets(criticalAssets);
gs.startSession();

// Load optional assets in background
gs.preloadAssets(optionalAssets).catch(console.warn);
```

### Complex State Updates

```typescript
// Instead of direct mutation
// gs.getState().score += 10; // DON'T DO THIS

// Use immutable updates
gs.updateState({
  score: gs.getState().score + 10,
  combo: gs.getState().combo + 1,
});
```

### Report Aggregation Pattern

```typescript
// Collect base metrics
gs.reportUpdater(() => ({
  sessionTime: diffTime(sessionStart),
  finalScore: gs.getState().score,
}));

// Add derived metrics
gs.reportUpdater((report) => ({
  ...report,
  efficiency: report.finalScore / report.sessionTime,
}));

// Add external data
gs.reportUpdater((report) => ({
  ...report,
  playerLevel: getCurrentPlayerLevel(),
  timestamp: Date.now(),
}));
```
