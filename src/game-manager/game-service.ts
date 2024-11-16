import { EventEmitter2, Listener, ListenerFn } from "eventemitter2";
import { ResultType } from "../types";
import { useSyncExternalStore } from "react";

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
  RESULT = "result.**",
  RESULT_UPDATE = "result.update",
}

export class GameService extends EventEmitter2 {
  private session: "initialized" | "active" | "paused" | "end";
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

    // for entire game
    this.name = name;
    this.results = [];
    this.currLevel = 0;
    this.assetsPreloaded = false;

    // session
    this.state = {};
    this.session = "initialized";
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

  getCurrLevel() {
    return this.currLevel;
  }

  isGameComplete() {
    return this.currLevel >= this.levels.length;
  }

  getCurrLevelDetails() {
    return this.levels[this.currLevel];
  }

  nextLevel() {
    this.currLevel = this.currLevel + 1;
  }

  getState() {
    return this.state;
  }

  updateState(state: Partial<GameState>) {
    this.state = { ...this.state, ...state };
    this.emit(GameEvents.STATE_UPDATE, this.state);
  }

  useGameState() {
    return useSyncExternalStore((cb) => {
      const listener = this.addStateListener(cb);
      return () => listener.off();
    }, this.getState.bind(this));
  }

  addStateListener(listener: ListenerFn) {
    return this.on(GameEvents.STATE, listener, { objectify: true }) as Listener;
  }

  getSession() {
    return this.session;
  }

  useSession() {
    return useSyncExternalStore((cb) => {
      const listener = this.addSessionListener(cb);
      return () => listener.off();
    }, this.getSession.bind(this));
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
    this.session = "end";

    this.emit(GameEvents.SESSION_END, result);
  }

  resetSession() {
    this.removeAllListeners();
    this.session = "initialized";
    this.state = {};
  }

  addSessionListener(fn: ListenerFn) {
    return this.on(GameEvents.SESSION, fn, { objectify: true }) as Listener;
  }

  addSessionEndListner(fn: (result: ResultType) => void) {
    this.on(GameEvents.SESSION_END, fn, { objectify: true }) as Listener;
  }

  getResults() {
    return this.results;
  }

  async collectResult(result = {}) {
    if (this.session === "end") {
      await this.emitAsync(GameEvents.RESULT_UPDATE, result);
      this.results.push(result);
    } else {
      this.debug("Cannot collect result, session is active");
    }

    return result;
  }

  updateResult(fn: (result: object) => object) {
    return this.on(GameEvents.RESULT_UPDATE, fn);
  }
}
