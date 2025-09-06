import { EventEmitter2, Listener, ListenerFn } from "eventemitter2";
import { useSyncExternalStore } from "react";
import { ResultType } from "../types";
import { AssetLoadResult, AssetProxy, createAssetProxy, preloadAssets } from "./asset-manager";
import { EventTracker, createEventTracker } from "./event-tracker";
import { LevelManager, createLevelManager } from "./level-manager";
import { Logger, createLogger } from "./logger";
import { ReportManager, createReportManager } from "./report-manager";
import { SessionManager, createSessionManager } from "./session-manager";

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
export class GameService<T extends string = string> extends EventEmitter2 {
  /** Store the state of the session */
  private state: GameState;
  // Utility managers
  private logger: Logger;
  private sessionManager: SessionManager;
  private levelManager: LevelManager;
  private eventTracker: EventTracker;
  private reportManager: ReportManager;

  /** Store arbitrary values */
  public data: Record<string, any>;

  /** Base path for asset loading */
  public assetsBasePath: string;

  /**
   * Proxy object for game assets
   * Provides warnings for missing/unloaded assets
   */
  public assets: AssetProxy;

  /**
   * Create a new GameService instance
   * @param name - Name of the game service
   * @param levels - Array of game levels
   * @param assets - Record of asset names to paths
   */
  constructor(public name: T, public levels: any[], assets: Record<string, string> = {}) {
    super({ wildcard: true, verboseMemoryLeak: true, newListener: true, removeListener: true, delimiter: "." });

    // Initialize state
    this.state = {};
    this.data = {};
    this.assetsBasePath = "";

    // Initialize utility managers
    this.logger = createLogger({ name });
    this.sessionManager = createSessionManager(this.logger);
    this.levelManager = createLevelManager(levels, this.logger);
    this.eventTracker = createEventTracker(() => this.sessionManager.getSessionStartTime());
    this.reportManager = createReportManager(this.logger);

    // Initialize assets proxy
    this.assets = createAssetProxy(assets, this.logger);
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
  async preloadAssets(
    partialAssets: Record<string, string> = Object.getPrototypeOf(this.assets)
  ): Promise<AssetLoadResult> {
    return preloadAssets(partialAssets, this.assetsBasePath, this.logger);
  }

  /**
   * Get the current level index
   * @returns Current level index
   */
  getCurrLevel() {
    return this.levelManager.getCurrLevel();
  }

  /**
   * Check if all levels are completed
   * @returns True if no more levels remain
   */
  isGameComplete() {
    return this.levelManager.isGameComplete();
  }

  /**
   * Get the details of the current level
   * @returns Current level details cast to type T
   * @template T - Type of level details
   */
  getCurrLevelDetails<T>() {
    return this.levelManager.getCurrLevelDetails<T>();
  }

  /**
   * Advance to the next level
   * @returns true if successfully advanced, false if already at last level
   */
  nextLevel(): boolean {
    return this.levelManager.nextLevel();
  }

  /**
   * Set the current level index
   * @param level - Level index to set
   */
  setCurrLevel(level: number) {
    return this.levelManager.setCurrLevel(level);
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
    return this.sessionManager.getSession();
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
    if (this.sessionManager.startSession()) {
      this.emit(GameEvents.SESSION_ACTIVE);
    }
  }

  /**
   * Pause the game session
   * Changes session state to "paused"
   */
  pauseSession() {
    if (this.sessionManager.pauseSession()) {
      this.emit(GameEvents.SESSION_PAUSE);
    }
  }

  /**
   * Resume a paused game session
   * Changes session state to "active"
   */
  resumeSession() {
    if (this.sessionManager.resumeSession()) {
      this.emit(GameEvents.SESSION_ACTIVE);
    }
  }

  /**
   * End the current session with a result
   * @param result - Outcome of the session: "error", "success", or "timeout"
   */
  endSession(result: Exclude<ResultType, "">) {
    if (this.sessionManager.endSession(result)) {
      if (result === "error") {
        this.emit(GameEvents.RESULT_ERROR);
      } else if (result === "success") {
        this.emit(GameEvents.RESULT_SUCCESS);
      } else if (result === "timeout") {
        this.emit(GameEvents.RESULT_TIMEOUT);
      }

      this.emit(GameEvents.SESSION_END, result);
    }
  }

  /**
   * Check if the current session has ended
   * @returns True if session state is "end"
   */
  isSessionEnded() {
    return this.sessionManager.isSessionEnded();
  }

  /**
   * Add a listener for session end events
   * @param fn - Callback function for session end
   * @deprecated Use addSessionEndListener instead (typo in method name)
   */
  addSessionEndListner(fn: (result: ResultType) => void) {
    this.on(GameEvents.SESSION_END, fn, { objectify: true }) as Listener;
  }

  /**
   * Add a listener for session end events
   * @param fn - Callback function for session end
   */
  addSessionEndListener(fn: (result: ResultType) => void) {
    this.on(GameEvents.SESSION_END, fn, { objectify: true }) as Listener;
  }

  /**
   * Reset the session to initial state
   * Removes all listeners and resets state and result
   */
  resetSession() {
    this.removeAllListeners();
    this.sessionManager.resetSession();
    this.state = {};
    this.eventTracker.clearEvents();
  }

  /**
   * Get the result of the current session
   * @returns Result of the session
   */
  getResult() {
    return this.sessionManager.getResult();
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
    return this.reportManager.getReports();
  }

  /**
   * Save a report to the reports history
   * @param report - Report data to save
   */
  saveReport(report: any) {
    this.reportManager.saveReport(report);
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
    if (this.sessionManager.getSession() === "end") {
      return this.reportManager.collectReport(initialReport);
    } else {
      this.logger.warn("collectReport should be called after session ends");
    }
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
    // Add to the report manager
    const removeUpdater = this.reportManager.addReportUpdater(fn);

    return {
      off: removeUpdater,
    };
  }

  /**
   * Track an event with metadata
   * @param event - Event name
   * @param metadata - Additional data to attach to the event
   */
  track(event: string, metadata: any = {}) {
    this.eventTracker.track(event, metadata);
  }

  /**
   * Get all tracked events
   * @returns Array of tracked events
   */
  getEvents() {
    return this.eventTracker.getEvents();
  }
}
