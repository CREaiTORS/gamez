import { EventEmitter2, Listener, ListenerFn } from "eventemitter2";
import { useSyncExternalStore } from "react";
import { ResultType } from "../types";

export type GameOverCB = (x: ResultType) => void;
export type GameListner = Omit<Listener, "emitter"> & { emitter: GameService };
export type GameState = Record<string, any>;

export enum GameEvents {
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

/**
 * GameService class for managing game session state and lifecycle.
 *
 * This class extends EventEmitter2 to provide event-based communication
 * throughout the game lifecycle. It handles:
 * - Game session management (active, paused, ended states)
 * - Level progression
 * - State management and updates
 * - Asset preloading and management
 * - Result tracking
 * - Reporting functionality
 *
 * @extends EventEmitter2
 */
/**
 * GameService class for managing game sessions, states, and events.
 * Extends EventEmitter2 to provide event handling capabilities.
 */
export class GameService<T extends string = string> extends EventEmitter2 {
  /**
   * Store the session state: initialized, active, paused or ended.
   * This is useful for tracking the current state of the game.
   * - initialized: before the start of the game
   * - active: when the game is running
   * - paused: when the game is paused for some reason
   * - end: when the game is finished (success, error, timeout)
   */
  private session: "initialized" | "active" | "paused" | "end";

  /** Store the state of the session */
  private state: GameState;

  /** Stores the report of previous sessions */
  private reports: object[];

  /** Current level index in levels array */
  private currLevel: number;

  /** Store the result of the session */
  private result: ResultType;

  /** Store arbitrary values */
  public data: Record<string, any>;

  /**
   * Proxy object for game assets
   * Provides warnings for missing/unloaded assets
   */
  public assets: Record<string, string>;

  /** Base path for asset loading */
  assetsBasePath: string;

  /**
   * Log debug information to console
   * @param x - Values to log
   */
  debug(...x: any[]) {
    console.info(`[${this.name}]:`, ...x);
  }

  /**
   * Log warning information to console
   * @param x - Values to log
   */
  warn(...x: any[]) {
    console.warn(`[${this.name}]:`, ...x);
  }

  /**
   * Create a new GameService instance
   * @param name - Name of the game service
   * @param levels - Array of game levels
   * @param assets - Record of asset names to paths
   */
  constructor(public name: T, public levels: any[], assets: Record<string, string> = {}) {
    super({ wildcard: true, verboseMemoryLeak: true, newListener: true, removeListener: true, delimiter: "." });

    // session
    this.result = "";
    this.state = {};
    this.data = {};
    this.session = "initialized";

    // for entire game
    this.name = name;
    this.reports = [];
    this.currLevel = 0;
    this.assetsBasePath = "";
    this.assets = new Proxy(assets, {
      get: (target, prop: string) => {
        if (!target[prop]) {
          this.warn(`Missing asset ${prop}:${target[prop]}`);
        } else if (!target[prop].startsWith("blob:")) {
          this.warn(`Asset ${prop}:${target[prop]} is not preloaded`);
        }

        return target[prop];
      },
      set: (target, prop: string, newValue) => {
        if (!newValue.startsWith("blob:")) {
          this.warn(`Can't update asset ${prop} with ${newValue}`);
          return false;
        } else {
          target[prop] = newValue;
          return true;
        }
      },
      getPrototypeOf() {
        return assets;
      },
    });
  }

  /**
   * Initialize the game state
   * Sets initial values like remaining lives, score, etc.
   * @param state - Initial game state
   */
  initState(state: GameState) {
    this.state = state;
    this.emit(GameEvents.STATE_INIT, this.state);
  }

  /**
   * Preload assets like images, videos, sounds
   * Fetches resources and creates blob URLs
   * @param partialAssets - Assets to load, defaults to all assets
   * @returns Promise that resolves when loading attempts complete
   */
  async preloadAssets(partialAssets: Record<string, string> = Object.getPrototypeOf(this.assets)) {
    await Promise.allSettled(
      Object.entries(partialAssets)
        .filter(([_name, src]) => !src.startsWith("blob:"))
        .map(([name, src]) =>
          fetch(this.assetsBasePath + src)
            .then((res) => (res.ok ? res.blob() : new Promise((_, reject) => reject(`Failed to load ${name}`))))
            .then((x) => (this.assets[name] = URL.createObjectURL(x as Blob)))
            .catch(this.warn.bind(this))
        )
    );
  }

  /**
   * Get the current level index
   * @returns Current level index
   */
  getCurrLevel() {
    return this.currLevel;
  }

  /**
   * Check if all levels are completed
   * @returns True if no more levels remain
   */
  isGameComplete() {
    return this.currLevel >= this.levels.length;
  }

  /**
   * Get the details of the current level
   * @returns Current level details cast to type T
   * @template T - Type of level details
   */
  getCurrLevelDetails<T>() {
    return this.levels[this.currLevel] as T;
  }

  /**
   * Advance to the next level
   */
  nextLevel() {
    this.currLevel = this.currLevel + 1;
  }

  /**
   * Set the current level index
   * @param level - Level index to set
   */
  setCurrLevel(level: number) {
    this.currLevel = level;
  }

  /**
   * Get the current game state
   * @returns Current game state
   */
  getState() {
    return this.state;
  }

  /**
   * Update the game state with new values
   * @param state - Partial state to merge with current state
   */
  updateState(state: Partial<GameState>) {
    this.state = { ...this.state, ...state };
    this.emit(GameEvents.STATE_UPDATE, this.state);
  }

  /**
   * React hook to subscribe to game state changes
   * @returns Current game state
   */
  useGameState() {
    return useSyncExternalStore((cb) => {
      const listener = this.addStateListener(cb);
      return () => listener.off();
    }, this.getState.bind(this));
  }

  /**
   * Add a listener for state change events
   * @param fn - Callback function for state changes
   * @returns Listener object with off() method
   */
  addStateListener(fn: ListenerFn) {
    return this.on(GameEvents.STATE, fn, { objectify: true }) as Listener;
  }

  /**
   * Get the current session state
   * @returns Session state: "initialized", "active", "paused", or "end"
   */
  getSession() {
    return this.session;
  }

  /**
   * Add a listener for session change events
   * @param fn - Callback function for session changes
   * @returns Listener object with off() method
   */
  addSessionListener(fn: ListenerFn) {
    return this.on(GameEvents.SESSION, fn, { objectify: true }) as Listener;
  }

  /**
   * React hook to subscribe to session state changes
   * @returns Current session state
   */
  useSession() {
    return useSyncExternalStore((cb) => {
      const listener = this.addSessionListener(cb);
      return () => listener.off();
    }, this.getSession.bind(this));
  }

  /**
   * Start the game session
   * Changes session state to "active"
   */
  startSession() {
    if (this.session !== "initialized") {
      return this.warn("reset session before starting");
    }

    this.session = "active";
    this.emit(GameEvents.SESSION_ACTIVE);
  }

  /**
   * Pause the game session
   * Changes session state to "paused"
   */
  pauseSession() {
    this.session = "paused";
    this.emit(GameEvents.SESSION_PAUSE);
  }

  /**
   * Resume a paused game session
   * Changes session state to "active"
   */
  resumeSession() {
    this.session = "active";
    this.emit(GameEvents.SESSION_ACTIVE);
  }

  /**
   * End the current session with a result
   * @param result - Outcome of the session: "error", "success", or "timeout"
   */
  endSession(result: Exclude<ResultType, "">) {
    this.session = "end";
    this.result = result;

    if (result === "error") {
      this.emit(GameEvents.RESULT_ERROR);
    } else if (result === "success") {
      this.emit(GameEvents.RESULT_SUCCESS);
    } else if (result === "timeout") {
      this.emit(GameEvents.RESULT_TIMEOUT);
    }

    this.emit(GameEvents.SESSION_END, result);
  }

  /**
   * Check if the current session has ended
   * @returns True if session state is "end"
   */
  isSessionEnded() {
    return this.session === "end";
  }

  /**
   * Add a listener for session end events
   * @param fn - Callback function for session end
   */
  addSessionEndListner(fn: (result: ResultType) => void) {
    this.on(GameEvents.SESSION_END, fn, { objectify: true }) as Listener;
  }

  /**
   * Reset the session to initial state
   * Removes all listeners and resets state and result
   */
  resetSession() {
    this.removeAllListeners();
    this.session = "initialized";
    this.state = {};
    this.result = "";
  }

  /**
   * Get the result of the current session
   * @returns Result of the session
   */
  getResult() {
    return this.result;
  }
  /**
   * Add a listener for result change events
   * @param fn - Callback function for result changes
   * @returns Listener object with off() method
   */
  addResultListener(fn: ListenerFn) {
    return this.on(GameEvents.RESULT, fn, { objectify: true }) as Listener;
  }

  /**
   * React hook to subscribe to result changes
   * @returns Current result
   */
  useResult() {
    return useSyncExternalStore((cb) => {
      const listener = this.addResultListener(cb);
      return () => listener.off();
    }, this.getResult.bind(this));
  }

  /**
   * Get all stored session reports
   * @returns Array of session reports
   */
  getReports() {
    return this.reports;
  }

  /**
   * Save a report to the reports history
   * @param report - Report data to save
   */
  saveReport(report: any) {
    this.reports.push(report);
  }

  /**
   * Collect a report from the session
   * Triggers report update event to collect data from updaters
   * @param initialReport - Starting report object
   * @returns Collected report with all updates applied
   * @example
   * gs.reportUpdater(() => ({ a: 1 }));
   * gs.reportUpdater(() => ({ a: 2 }));
   * gs.reportUpdater((x) => ({ b: 3, c: x.a + 2 }));
   * const report = gs.collectReport({ d: 5 });
   * console.log(report); // { a: 2, b: 3, c: 4, d: 5 }
   */
  collectReport(initialReport = {}) {
    if (this.session === "end") {
      // initialReport will be updated by reportUpdater
      this.emit(GameEvents.REPORT_UPDATE, initialReport);
    } else {
      this.warn("Cannot collect report, session is still active");
    }

    return initialReport;
  }

  /**
   * Register a function to update the report when collectReport is called
   * @param fn - Function that receives the current report and returns updates
   * @returns Listener object with off() method
   * @example
   * gs.reportUpdater(() => ({ a: 1 }));
   * gs.reportUpdater(() => ({ a: 2 }));
   * gs.reportUpdater((x) => ({ b: 3, c: x.a + 2 }));
   * const report = gs.collectReport();
   * console.log(report); // { a: 2, b: 3, c: 4 }
   */
  reportUpdater(fn: (report: any) => any) {
    return this.on(GameEvents.REPORT_UPDATE, (x) => Object.assign(x, fn(x)), { objectify: true }) as Listener;
  }
}
