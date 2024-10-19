import { EventEmitter2, Listener, ListenerFn } from "eventemitter2";
import { ResultType } from "../types";
import { useSyncExternalStore } from "react";

export type GameOverCB = (x: ResultType) => void;
export type GameListner = Omit<Listener, "emitter"> & { emitter: GameService };
export type GameState = Record<string, any>;

export enum GameEvents {
  SESSION = "session",
  SESSION_ACTIVE = "session.active",
  SESSION_PAUSE = "session.pause",
  SESSION_COMPLETE = "session.complete",
  STATE = "state",
  STATE_INIT = "state.init",
  STATE_UPDATE = "state.update",
  RESULT = "result",
  RESULT_UPDATE = "result.update",
}

export class GameService extends EventEmitter2 {
  private session: "initialized" | "active" | "paused" | "complete";
  private state: GameState;
  private results: object[];
  private currLevel: number;
  assetsPreloaded: boolean;

  debug(...x: any[]) {
    console.info(`[${this.name}]:`, ...x);
  }
  warn(...x: any[]) {
    console.warn(`[${this.name}]:`, ...x);
  }

  constructor(public name: string, public levels: any[], public assets: Record<string, string> = {}) {
    super({ wildcard: true, verboseMemoryLeak: true, newListener: true, removeListener: true, delimiter: "." });

    this.name = name;
    this.results = [];
    this.session = "initialized";
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

  nextLevel() {
    this.currLevel = this.currLevel + 1;
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
    return this.on(GameEvents.STATE, listener, { objectify: true }) as Listener;
  }

  getSession() {
    return this.session;
  }

  useSession() {
    return useSyncExternalStore((cb) => {
      this.on(GameEvents.SESSION, cb);
      return () => this.off(GameEvents.SESSION, cb);
    }, this.getSession);
  }

  startSession() {
    if (this.session !== "initialized") {
      return this.warn("reset session before starting");
    }

    this.session = "active";
    this.emit(GameEvents.SESSION_ACTIVE);
  }

  pauseSession() {
    this.session = "paused";
    this.emit(GameEvents.SESSION_PAUSE);
  }

  resumeSession() {
    this.session = "active";
    this.emit(GameEvents.SESSION_ACTIVE);
  }

  endSession(result: ResultType) {
    this.session = "complete";

    this.emit(GameEvents.SESSION_COMPLETE, result);
  }

  resetSession() {
    this.session = "initialized";
    this.removeAllListeners(GameEvents.STATE);
    this.removeAllListeners(GameEvents.RESULT_UPDATE);
    this.removeAllListeners(GameEvents.SESSION);
    this.removeAllListeners();
  }

  onSessionEnd(fn: (result: ResultType) => void) {
    this.addListener(GameEvents.SESSION_COMPLETE, fn);
  }

  addSessionListener(listener: ListenerFn) {
    return this.on("session", listener);
  }

  getResults() {
    return this.results;
  }

  async collectResult(result = {}) {
    if (this.session === "complete") {
      await this.emitAsync(GameEvents.RESULT_UPDATE, result);
      this.results.push(result);
    } else {
      this.debug("Cannot collect result, session is not complete");
    }

    return result;
  }

  updateResult(listener: (result: object) => object) {
    return this.on(GameEvents.RESULT_UPDATE, listener);
  }
}
