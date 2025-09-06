# Testing Guide

## Overview

GameZ uses Jest and React Testing Library for comprehensive testing. This guide covers testing strategies, patterns, and best practices for the GameZ toolkit.

## Test Structure

```
src/
├── __tests__/           # Integration tests
├── utils/
│   ├── arrays.test.ts   # Unit tests for utilities
│   └── ...
├── hooks/
│   ├── useCountDown.test.ts
│   └── ...
├── game-manager/
│   ├── game-service.test.ts
│   └── ...
└── components/
    ├── __tests__/       # Component tests
    └── ...
```

## Testing Patterns

### GameService Testing

```typescript
import { GameService, GameEvents } from "../game-manager";

describe("GameService", () => {
  let gs: GameService;

  beforeEach(() => {
    gs = new GameService("test-game", [{ level: 1 }]);
  });

  test("should manage session lifecycle correctly", () => {
    expect(gs.getSession()).toBe("initialized");

    gs.startSession();
    expect(gs.getSession()).toBe("active");

    gs.pauseSession();
    expect(gs.getSession()).toBe("paused");

    gs.resumeSession();
    expect(gs.getSession()).toBe("active");

    gs.endSession("success");
    expect(gs.getSession()).toBe("end");
    expect(gs.getResult()).toBe("success");
  });
});
```

### Hook Testing with React Testing Library

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCountDown } from "../hooks";

describe("useCountDown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should countdown correctly", () => {
    const { result } = renderHook(() => useCountDown(5));

    expect(result.current.countDown).toBe(5);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.countDown).toBe(4);
  });
});
```

### Component Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { GameService } from "../game-manager";
import { GameServiceWrapper, ResultOverlay } from "../components";

describe("ResultOverlay", () => {
  let gs: GameService;

  beforeEach(() => {
    gs = new GameService("test", []);
  });

  test("should display success image on success result", () => {
    gs.startSession();
    gs.endSession("success");

    render(
      <GameServiceWrapper gs={gs}>
        <ResultOverlay />
      </GameServiceWrapper>
    );

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", "./images/success.png");
  });
});
```

### Async Testing for Asset Loading

```typescript
describe("Asset Loading", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    global.URL.createObjectURL = jest.fn(() => "blob:test");
  });

  test("should handle successful asset loading", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "image/png" },
      blob: () => Promise.resolve(new Blob()),
    });

    const gs = new GameService("test", [], { bg: "/bg.png" });
    const result = await gs.preloadAssets();

    expect(result.successful).toContain("bg");
    expect(result.failed).toBe(0);
  });

  test("should handle failed asset loading", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const gs = new GameService("test", [], { bg: "/bg.png" });
    const result = await gs.preloadAssets();

    expect(result.failed).toBe(1);
    expect(result.successful).not.toContain("bg");
  });
});
```

### Event System Testing

```typescript
describe("Event System", () => {
  test("should emit and handle events correctly", () => {
    const gs = new GameService("test", []);
    const listener = jest.fn();

    gs.on(GameEvents.SESSION_ACTIVE, listener);
    gs.startSession();

    expect(listener).toHaveBeenCalled();
  });

  test("should remove listeners on cleanup", () => {
    const gs = new GameService("test", []);
    const listener = jest.fn();

    const listenerObj = gs.addSessionListener(listener);
    listenerObj.off();

    gs.startSession();
    expect(listener).not.toHaveBeenCalled();
  });
});
```

## Mock Strategies

### Mocking External Dependencies

```typescript
// Mock Howler for audio tests
jest.mock("howler", () => ({
  Howl: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    volume: jest.fn(),
    loop: jest.fn(),
  })),
}));

// Mock React Icons
jest.mock("react-icons/fa", () => ({
  FaHeart: () => <div data-testid="heart-icon" />,
}));
```

### Mocking GameService

```typescript
const createMockGameService = (overrides = {}) => ({
  getSession: jest.fn(() => "initialized"),
  getState: jest.fn(() => ({})),
  getResult: jest.fn(() => ""),
  startSession: jest.fn(),
  pauseSession: jest.fn(),
  endSession: jest.fn(),
  useGameState: jest.fn(() => ({})),
  useSession: jest.fn(() => "initialized"),
  useResult: jest.fn(() => ""),
  ...overrides,
});
```

## Testing Utils and Custom Matchers

### Custom Jest Matchers

```typescript
// jest/custom-matchers.ts
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },
});
```

### Test Utilities

```typescript
// test-utils.ts
export const createTestGameService = (options = {}) => {
  return new GameService("test-game", [{ level: 1 }], options);
};

export const waitForAsyncUpdates = () => new Promise((resolve) => setTimeout(resolve, 0));

export const mockFetch = (response: any) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    blob: () => Promise.resolve(new Blob()),
    ...response,
  });
};
```

## Integration Testing

### Game Flow Testing

```typescript
describe("Complete Game Flow", () => {
  test("should handle full game lifecycle", async () => {
    const gs = new GameService("integration-test", [
      { level: 1, lives: 3 },
      { level: 2, lives: 2 },
    ]);

    // Initialize
    gs.initState({ score: 0, lives: 3 });
    expect(gs.getSession()).toBe("initialized");

    // Start game
    gs.startSession();
    expect(gs.getSession()).toBe("active");

    // Update state during gameplay
    gs.updateState({ score: 100 });
    expect(gs.getState().score).toBe(100);

    // Complete level
    gs.endSession("success");
    expect(gs.getSession()).toBe("end");

    // Advance to next level
    gs.nextLevel();
    expect(gs.getCurrLevel()).toBe(1);

    // Reset for next game
    gs.resetSession();
    expect(gs.getSession()).toBe("initialized");
  });
});
```

## Performance Testing

### Memory Leak Detection

```typescript
describe("Memory Management", () => {
  test("should clean up listeners on reset", () => {
    const gs = new GameService("memory-test", []);

    // Add multiple listeners
    const listeners = Array.from({ length: 100 }, () => gs.addSessionListener(() => {}));

    expect(gs.listenerCount()).toBeGreaterThan(0);

    gs.resetSession();
    expect(gs.listenerCount()).toBe(0);
  });
});
```

### Asset Loading Performance

```typescript
describe("Asset Performance", () => {
  test("should load assets in parallel", async () => {
    const startTime = Date.now();

    const gs = new GameService("perf-test", [], {
      asset1: "/asset1.png",
      asset2: "/asset2.png",
      asset3: "/asset3.png",
    });

    await gs.preloadAssets();

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // Should complete quickly
  });
});
```

## Best Practices

### 1. Test Isolation

- Use `beforeEach` to create fresh instances
- Mock external dependencies consistently
- Clean up timers and listeners

### 2. Descriptive Test Names

```typescript
// Good
test("should pause session when currently active");

// Avoid
test("pause test");
```

### 3. Test Edge Cases

```typescript
test("should handle empty level array gracefully", () => {
  const gs = new GameService("empty-test", []);
  expect(gs.isGameComplete()).toBe(true);
});
```

### 4. Error Testing

```typescript
test("should throw error for invalid session transitions", () => {
  const gs = new GameService("error-test", []);

  // Spy on warn method
  const warnSpy = jest.spyOn(gs, "warn");

  gs.pauseSession(); // Invalid transition
  expect(warnSpy).toHaveBeenCalled();
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- arrays.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="countdown"
```

## Coverage Goals

- **Unit Tests**: 90%+ coverage for utilities and core logic
- **Integration Tests**: Cover all major user flows
- **Component Tests**: Test user interactions and props
- **Edge Cases**: Error conditions and boundary values
