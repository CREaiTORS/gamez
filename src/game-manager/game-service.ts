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
}

export class GameService extends EventEmitter2 {
  private status: "initialized" | "active" | "game-over";
  private state: GameState;
  private results: any[];

  constructor(public name: string, public levels: any[], public assets: Record<string, string> = {}) {
    super({ wildcard: true, verboseMemoryLeak: true, newListener: true, removeListener: true, delimiter: "." });

    this.name = name;
    this.results = [];
    this.status = "initialized";
    this.state = {};
  }

  debug(...x: any[]) {
    console.info(`[${this.name}]:`, ...x);
  }

  getState() {
    this.state;
  }

  initState(state: GameState) {
    this.state = state;
    this.emit(GameEvents.STATE_INIT, this.state);
  }

  preloadAssets() {
    return Promise.allSettled(
      Object.entries(this.assets).map(([name, src]) =>
        fetch(src)
          .then((res) => res.blob())
          .then((x) => (this.assets[name] = URL.createObjectURL(x)))
          .catch(console.warn)
      )
    );
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

  startSession() {
    this.status = "active";
    this.emit(GameEvents.GAME_STARTED);
  }

  endSession() {
    this.status = "game-over";
    this.emit(GameEvents.GAME_OVER);
  }

  addSessionListener(listener: ListenerFn) {
    return this.on("session", listener);
  }

  getResults() {
    return this.results;
  }

  async collectResult(result = {}) {
    if (this.status === "active") {
      await this.emitAsync("result", result);
      this.results.push(result);
    } else {
      this.debug("Cannot collect result, game is not active");
    }
  }
}
