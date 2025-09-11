import { GameEvents, GameService } from "./game-service";

global.URL.createObjectURL = jest.fn((blob: any) => `blob:${blob.size}#t=${Date.now()}`);

describe("GameService", () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService("TestGame", [{ level: 1 }, { level: 2 }]);
  });

  test("should initialize with correct default values", () => {
    expect(gameService.getSession()).toBe("initialized");
    expect(gameService.getState()).toEqual({});
    expect(gameService.getCurrLevel()).toBe(0);
    expect(gameService.getReports()).toEqual([]);
    expect(gameService.getResult()).toBe("");
  });

  test("should initialize state and emit STATE_INIT event", () => {
    const state = { score: 0, lives: 3 };
    const stateInitListener = jest.fn();

    gameService.on(GameEvents.STATE_INIT, stateInitListener);
    gameService.initState(state);

    expect(gameService.getState()).toEqual(state);
    expect(stateInitListener).toHaveBeenCalledWith(state);
  });

  test("should update state and emit STATE_UPDATE event", () => {
    const initialState = { score: 0, lives: 3 };
    const updatedState = { score: 10 };
    const stateUpdateListener = jest.fn();

    gameService.initState(initialState);
    gameService.on(GameEvents.STATE_UPDATE, stateUpdateListener);
    gameService.updateState(updatedState);

    expect(gameService.getState()).toEqual({ ...initialState, ...updatedState });
    expect(stateUpdateListener).toHaveBeenCalledWith({ ...initialState, ...updatedState });
  });

  test("should start session and emit SESSION_ACTIVE event", () => {
    const sessionActiveListener = jest.fn();

    gameService.on(GameEvents.SESSION_ACTIVE, sessionActiveListener);
    gameService.startSession();

    expect(gameService.getSession()).toBe("active");
    expect(sessionActiveListener).toHaveBeenCalled();
  });

  test("should pause session and emit SESSION_PAUSE event", () => {
    const sessionPauseListener = jest.fn();

    gameService.startSession();
    gameService.on(GameEvents.SESSION_PAUSE, sessionPauseListener);
    gameService.pauseSession();

    expect(gameService.getSession()).toBe("paused");
    expect(sessionPauseListener).toHaveBeenCalled();
  });

  test("should resume session and emit SESSION_ACTIVE event", () => {
    const sessionActiveListener = jest.fn();

    gameService.startSession();
    gameService.pauseSession();
    gameService.on(GameEvents.SESSION_ACTIVE, sessionActiveListener);
    gameService.resumeSession();

    expect(gameService.getSession()).toBe("active");
    expect(sessionActiveListener).toHaveBeenCalled();
  });

  test("should end session and emit appropriate result events", () => {
    const sessionEndListener = jest.fn();
    const resultSuccessListener = jest.fn();

    gameService.startSession();
    gameService.on(GameEvents.SESSION_END, sessionEndListener);
    gameService.on(GameEvents.RESULT_SUCCESS, resultSuccessListener);
    gameService.endSession("success");

    expect(gameService.getSession()).toBe("end");
    expect(gameService.getResult()).toBe("success");
    expect(sessionEndListener).toHaveBeenCalledWith("success");
    expect(resultSuccessListener).toHaveBeenCalled();
  });

  test("should reset session to initial state", () => {
    gameService.startSession();
    gameService.endSession("success");
    gameService.resetSession();

    expect(gameService.getSession()).toBe("initialized");
    expect(gameService.getState()).toEqual({});
    expect(gameService.getResult()).toBe("");
  });

  test("should move to the next level", () => {
    gameService.nextLevel();
    expect(gameService.getCurrLevel()).toBe(1);
  });

  test("should determine if the game is complete", () => {
    gameService.setCurrLevel(0); // Set to last level (index 0)
    expect(gameService.isGameComplete()).toBe(false);
    gameService.setCurrLevel(1); // Set to last level (index 1)
    expect(gameService.isGameComplete()).toBe(true); // complete
    gameService.nextLevel(); // advance
    expect(gameService.isGameComplete()).toBe(true); // still complete
  });

  test("should preload assets", async () => {
    const assets = { image: "test.png" };
    gameService = new GameService("TestGame", [], assets);
    gameService.assetsBasePath = "/assets/";

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: jest.fn((key: string) => {
          if (key === "content-type") return "image/png";
          return null;
        }),
      },
      blob: jest.fn().mockResolvedValue(new Blob()),
    });

    const result = await gameService.preloadAssets();
    expect(fetch).toHaveBeenCalledWith("/assets/test.png");
    expect(result.successful).toContain("image");
    expect(result.failed).toBe(0);
  });

  test("should collect report after session ends", () => {
    const reportUpdater = jest.fn((report) => ({ ...report, score: 100 }));
    gameService.reportUpdater(reportUpdater);

    gameService.startSession();
    gameService.endSession("success");

    const report = gameService.collectReport();
    expect(report).toEqual({ score: 100 });
  });

  test("should get current level details", () => {
    expect(gameService.getCurrLevelDetails()).toEqual({ level: 1 });
    gameService.nextLevel();
    expect(gameService.getCurrLevelDetails()).toEqual({ level: 2 });
  });

  test("should handle error results", () => {
    const resultErrorListener = jest.fn();
    const sessionEndListener = jest.fn();

    gameService.startSession();
    gameService.on(GameEvents.RESULT_ERROR, resultErrorListener);
    gameService.on(GameEvents.SESSION_END, sessionEndListener);
    gameService.endSession("error");

    expect(gameService.getSession()).toBe("end");
    expect(gameService.getResult()).toBe("error");
    expect(resultErrorListener).toHaveBeenCalled();
    expect(sessionEndListener).toHaveBeenCalledWith("error");
  });

  test("should handle timeout results", () => {
    const resultTimeoutListener = jest.fn();

    gameService.startSession();
    gameService.on(GameEvents.RESULT_TIMEOUT, resultTimeoutListener);
    gameService.endSession("timeout");

    expect(gameService.getSession()).toBe("end");
    expect(gameService.getResult()).toBe("timeout");
    expect(resultTimeoutListener).toHaveBeenCalled();
  });

  test("should add session end listener", () => {
    const sessionEndListener = jest.fn();

    gameService.addSessionEndListener(sessionEndListener);
    gameService.startSession();
    gameService.endSession("success");

    expect(sessionEndListener).toHaveBeenCalledWith("success");
  });

  test("should determine if session is ended", () => {
    expect(gameService.isSessionEnded()).toBe(false);
    gameService.startSession();
    expect(gameService.isSessionEnded()).toBe(false);
    gameService.endSession("success");
    expect(gameService.isSessionEnded()).toBe(true);
  });

  test("should save report", () => {
    const report = { score: 100, time: 30 };
    gameService.saveReport(report);
    expect(gameService.getReports()).toContain(report);
  });

  test("should chain multiple report updaters", () => {
    gameService.reportUpdater(() => ({ score: 50 }));
    gameService.reportUpdater((report) => ({
      ...report,
      time: 20,
    }));
    gameService.reportUpdater((report) => ({
      ...report,
      finalScore: report.score * 2,
    }));

    gameService.startSession();
    gameService.endSession("success");

    const report = gameService.collectReport();
    expect(report).toEqual({
      score: 50,
      time: 20,
      finalScore: 100,
    });
  });

  test("should warn when collecting report without ending session", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    gameService.startSession();
    console.log(gameService.getSession());
    gameService.collectReport();
    expect(consoleSpy).toHaveBeenCalledWith("[TestGame]:", "collectReport should be called after session ends");
    consoleSpy.mockRestore();
  });
});
