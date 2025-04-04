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

export class GameService extends EventEmitter2 {
  /** Store the session, either initialized, active, paused or ended.
   * This is useful for tracking the current state of the game.
   * For example, you have to stop the game when it's ended, you have to pause the game when it's paused.
   * initialized is before the start of the game
   * active is when the game is running
   * paused is when the game is paused for some reason
   * end is when the game is finished this could be because of success, error, timeout */
  private session: "initialized" | "active" | "paused" | "end";
  /** store the state of the session */
  private state: GameState;
  /** stores the report of previous sessions */
  private reports: object[];
  /** current level index in levels array */
  private currLevel: number;
  /** store the result of the session */
  private result: ResultType;
  /** Store arbitrary values */
  public data: Record<string, any>;
  public assets: Record<string, string>;

  assetsBasePath: string;

  debug(...x: any[]) {
    console.info(`[${this.name}]:`, ...x);
  }
  warn(...x: any[]) {
    console.warn(`[${this.name}]:`, ...x);
  }

  constructor(public name: string, public levels: any[], assets: Record<string, string> = {}) {
    super({ wildcard: true, verboseMemoryLeak: true, newListener: true, removeListener: true, delimiter: "." });

    // for entire game
    this.name = name;
    this.reports = [];
    this.currLevel = 0;

    // session
    this.result = "";
    this.state = {};
    this.data = {};
    this.session = "initialized";
    this.assetsBasePath = "";
    this.assets = new Proxy(assets, {
      get: (target, prop: string) => {
        if (!target[prop].startsWith("blob:")) {
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
  /** initial value of your state, like settings remaining lives to available lives, or score to zero. */
  initState(state: GameState) {
    this.state = state;
    this.emit(GameEvents.STATE_INIT, this.state);
  }

  /**
   * Load your assets like img, video, sound, etc.
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

  getCurrLevel() {
    return this.currLevel;
  }

  /** game is complete when no more levels are left */
  isGameComplete() {
    return this.currLevel >= this.levels.length;
  }

  getCurrLevelDetails<T>() {
    return this.levels[this.currLevel] as T;
  }

  // move to the next level
  nextLevel() {
    this.currLevel = this.currLevel + 1;
  }

  setCurrLevel(level: number) {
    this.currLevel = level;
  }

  /** get state of the session, state is just internal values like score, remaining lives etc */
  getState() {
    return this.state;
  }

  updateState(state: Partial<GameState>) {
    this.state = { ...this.state, ...state };
    this.emit(GameEvents.STATE_UPDATE, this.state);
  }

  /** use this when you want to update the component when the state changes */
  useGameState() {
    return useSyncExternalStore((cb) => {
      const listener = this.addStateListener(cb);
      return () => listener.off();
    }, this.getState.bind(this));
  }

  /** fn will be called when the state changes */
  addStateListener(fn: ListenerFn) {
    return this.on(GameEvents.STATE, fn, { objectify: true }) as Listener;
  }

  getSession() {
    return this.session;
  }

  addSessionListener(fn: ListenerFn) {
    return this.on(GameEvents.SESSION, fn, { objectify: true }) as Listener;
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

  /** when the session ends call this function with the result of the session */
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

  isSessionEnded() {
    return this.session === "end";
  }

  addSessionEndListner(fn: (result: ResultType) => void) {
    this.on(GameEvents.SESSION_END, fn, { objectify: true }) as Listener;
  }

  // to be called before moving to the next session
  resetSession() {
    this.removeAllListeners();
    this.session = "initialized";
    this.state = {};
    this.result = "";
  }

  getResult() {
    return this.result;
  }

  addResultListener(fn: ListenerFn) {
    return this.on(GameEvents.RESULT, fn, { objectify: true }) as Listener;
  }

  useResult() {
    return useSyncExternalStore((cb) => {
      const listener = this.addResultListener(cb);
      return () => listener.off();
    }, this.getResult.bind(this));
  }

  // all your stored reports
  getReports() {
    return this.reports;
  }

  /** based on session result you may choose to save */
  saveReport(report: any) {
    this.reports.push(report);
  }

  /**   
  When session ends you need to collect report.
  report is data collected from the session.
  collectReport will call reportUpdater and collect report, but it will not save report, you have to do it yourself

  @example
    gs.reportUpdater(() => ({ a: 1 }));
    gs.reportUpdater(() => ({ a: 2 }));
    gs.reportUpdater((x) => ({ b: 3, c: x.a + 2 }));
  
    const report = gs.collectReport();
    console.log(report); // { a: 2, b: 3, c: 4 }
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
  this function is used to update the report when collectReport is called
  this function accepts a updater function which updates the report
  
  @example
    gs.reportUpdater(() => ({ a: 1 }));
    gs.reportUpdater(() => ({ a: 2 }));
    gs.reportUpdater((x) => ({ b: 3, c: x.a + 2 }));
  
    const report = gs.collectReport();
    console.log(report); // { a: 2, b: 3, c: 4 }
  */
  reportUpdater(fn: (report: any) => any) {
    return this.on(GameEvents.REPORT_UPDATE, (x) => Object.assign(x, fn(x)), { objectify: true }) as Listener;
  }
}
