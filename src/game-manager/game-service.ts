import { EventEmitter2, Listener, ListenerFn } from "eventemitter2";
import { ResultType } from "../types";
import { useSyncExternalStore } from "react";

export type GameOverCB = (x: ResultType) => void;
export type GameListner = Omit<Listener, "emitter"> & { emitter: GameService };
export type GameState = Record<string, any>;

export enum GameEvents {
  SESSION = "session",
  GAME_STARTED = "session.game-started",
  GAME_OVER = "session.game-over",
  STATE = "state",
  STATE_INIT = "state.init",
  STATE_UPDATE = "state.update",
  COLLECT_RESULT = "collect-result",
}

export class GameService extends EventEmitter2 {
  private status: "initialized" | "active" | "paused" | "game-over";
  private state: GameState;
  private results: object[];
  private currLevel: number;
  assetsPreloaded: boolean;

  debug(...x: any[]) {
    console.info(`[${this.name}]:`, ...x);
  }

  constructor(public name: string, public levels: any[], public assets: Record<string, string> = {}) {
    super({ wildcard: true, verboseMemoryLeak: true, newListener: true, removeListener: true, delimiter: "." });

    this.name = name;
    this.results = [];
    this.status = "initialized";
    this.state = {};
    this.currLevel = 0;
    this.assetsPreloaded = false;
  }

  initState(state: GameState) {
    this.state = state;
    this.emit(GameEvents.STATE_INIT, this.state);
  }

  async preloadAssets() {
    if (this.assetsPreloaded) return Promise.resolve();

    await Promise.allSettled(
      Object.entries(this.assets).map(([name, src]) =>
        fetch(src)
          .then((res) => res.blob())
          .then((x) => (this.assets[name] = URL.createObjectURL(x)))
          .catch(console.warn)
      )
    );
    this.assetsPreloaded = true;
  }

  getState() {
    this.state;
  }

  getCurrLevel() {
    return this.currLevel;
  }

  getCurrentLevelDetails() {
    return this.levels[this.currLevel];
  }

  isGameComplete() {
    return this.currLevel >= this.levels.length;
  }

  updateState(state: Partial<GameState>) {
    this.state = { ...this.state, ...state };
    this.emit(GameEvents.STATE_UPDATE, this.state);
  }

  useGameState() {
    return useSyncExternalStore((cb) => {
      this.on(GameEvents.STATE, cb);
      return () => this.off(GameEvents.STATE, cb);
    }, this.getState);
  }

  addStateListener(listener: ListenerFn) {
    return this.on("state", listener, { objectify: true }) as Listener;
  }

  getStatus() {
    return this.status;
  }

  useStatus() {
    return useSyncExternalStore((cb) => {
      this.on(GameEvents.SESSION, cb);
      return () => this.off(GameEvents.SESSION, cb);
    }, this.getStatus);
  }

  startSession() {
    this.status = "active";
    this.emit(GameEvents.GAME_STARTED, this.status);
  }

  pauseSession() {
    this.status = "paused";
    this.emit(GameEvents.SESSION, this.status);
  }

  resumeSession() {
    this.status = "active";
    this.emit(GameEvents.SESSION, this.status);
  }

  endSession() {
    this.status = "game-over";
    this.emit(GameEvents.GAME_OVER, this.status);
  }

  addSessionListener(listener: ListenerFn) {
    return this.on("session", listener);
  }

  getResults() {
    return this.results;
  }

  async collectResult(result = {}) {
    if (this.status === "active") {
      await this.emitAsync(GameEvents.COLLECT_RESULT, result);
      this.results.push(result);
    } else {
      this.debug("Cannot collect result, game is not active");
    }

    return result;
  }

  updateResult(listener: (result: object) => object) {
    return this.on(GameEvents.COLLECT_RESULT, listener);
  }
}
