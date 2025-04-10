import { expect } from "@jest/globals";
import { getRandomNumbersArray } from "./arrays";
import { getRandomBoolean, getRandomFloat, getRandomNum, getRandomNumbers } from "./random-numbers";

jest.mock("./arrays", () => ({
  getRandomNumbersArray: jest.fn(),
}));

describe("random-numbers utility functions", () => {
  describe("getRandomNum", () => {
    it("should generate a random number within the specified range", () => {
      const min = 5;
      const max = 10;
      const result = getRandomNum(max, min);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThan(max);
    });

    it("should default min to 0 if not provided", () => {
      const max = 10;
      const result = getRandomNum(max);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(max);
    });

    it("should get random number in equal proportion", () => {
      const max = 100;
      const repeat = 1_000_000;
      const count = new Map<number, number>();
      for (let i = 0; i < repeat; i++) {
        const random = getRandomNum(max);
        count.set(random, (count.get(random) ?? 0) + 1);
      }

      const expectedCount = repeat / max;
      for (let i = 0; i < max; i++) {
        // Check that the count is within 10% of the expected count.
        expect(count.get(i)).toBeWithinRange(expectedCount * 0.9, expectedCount * 1.1);
      }
    });
  });

  describe("getRandomNumbers", () => {
    it("should return a Set of random numbers", () => {
      const length = 5;
      const max = 10;
      const min = 2;
      const mockArray = [2, 3, 4, 5, 6];
      (getRandomNumbersArray as jest.Mock).mockReturnValue(mockArray);

      const result = getRandomNumbers(length, max, min);
      expect(result).toBeInstanceOf(Set);
      expect(Array.from(result)).toEqual(mockArray);
      expect(getRandomNumbersArray).toHaveBeenCalledWith(length, max, min);
    });
  });

  describe("getRandomFloat", () => {
    it("should generate a random float within the specified range", () => {
      const min = 1.5;
      const max = 5.5;
      const result = getRandomFloat(max, min);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThan(max);
    });

    it("should default min to 0 if not provided", () => {
      const max = 5.5;
      const result = getRandomFloat(max);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(max);
    });
  });

  describe("getRandomBoolean", () => {
    it("should generate a random boolean value", () => {
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        results.add(getRandomBoolean());
      }
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });
  });
});
