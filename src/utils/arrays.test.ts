import { getRandomElementFromArray, getRandomNElementsFromArray, getRandomNumbersArray, shuffleArray } from "./arrays";

describe("arrays utility functions", () => {
  describe("getRandomNElementsFromArray", () => {
    it("should return an array of N randomly selected elements", () => {
      const input = [1, 2, 3, 4, 5];
      const result = getRandomNElementsFromArray(input, 3);
      expect(result).toHaveLength(3);
      result.forEach((element) => {
        expect(input).toContain(element);
      });
    });

    it("should return an empty array if N is 0", () => {
      const input = [1, 2, 3];
      const result = getRandomNElementsFromArray(input, 0);
      expect(result).toEqual([]);
    });

    it("should return the entire array if N is greater than array length", () => {
      const input = [1, 2, 3];
      const result = getRandomNElementsFromArray(input, 5);
      expect(result).toHaveLength(input.length);
      result.forEach((element) => {
        expect(input).toContain(element);
      });
    });
  });

  describe("shuffleArray", () => {
    it("should return an array with the same elements in random order", () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray(input);
      expect(result).toHaveLength(input.length);
      expect(result.sort()).toEqual(input.sort());
    });

    it("should not modify the original array when copy is true", () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray(input, true);
      expect(result).not.toBe(input);
    });

    it("should modify the original array when copy is false", () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray(input, false);
      expect(result).toBe(input);
    });
  });

  describe("getRandomElementFromArray", () => {
    it("should return a random element from the array", () => {
      const input = [1, 2, 3, 4, 5];
      const result = getRandomElementFromArray(input);
      expect(input).toContain(result);
    });

    it("should return undefined for an empty array", () => {
      const input: number[] = [];
      const result = getRandomElementFromArray(input);
      expect(result).toBeUndefined();
    });
  });

  describe("getRandomNumbersArray", () => {
    it("should return an array of random numbers within the specified range", () => {
      const result = getRandomNumbersArray(5, 10, 1);
      expect(result).toHaveLength(5);
      result.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThan(10);
      });
    });

    it("should handle cases where length is greater than the range", () => {
      const result = getRandomNumbersArray(10, 5, 1);
      expect(result).toHaveLength(10);
      result.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThan(5);
      });
    });

    it("should return an empty array if length is 0", () => {
      const result = getRandomNumbersArray(0, 10, 1);
      expect(result).toEqual([]);
    });
  });
  describe("Additional array utility function tests", () => {
    describe("getRandomElementFromArray additional tests", () => {
      it("should return the only element for a single-element array", () => {
        const input = [42];
        const result = getRandomElementFromArray(input);
        expect(result).toBe(42);
      });

      it("should handle arrays with non-numeric values", () => {
        const input = ["apple", "banana", "cherry"];
        const result = getRandomElementFromArray(input);
        expect(input).toContain(result);
      });
    });

    describe("getRandomNElementsFromArray additional tests", () => {
      it("should return unique elements (no duplicates)", () => {
        const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const result = getRandomNElementsFromArray(input, 5);
        const uniqueResults = new Set(result);
        expect(uniqueResults.size).toBe(result.length);
      });

      it("should handle arrays with mixed types", () => {
        const input = [1, "two", { three: 3 }, [4]];
        const result = getRandomNElementsFromArray(input, 2);
        expect(result).toHaveLength(2);
        result.forEach((element) => {
          expect(input).toContain(element);
        });
      });
    });

    describe("shuffleArray additional tests", () => {
      it("should not change a single-element array", () => {
        const input = [42];
        const result = shuffleArray(input);
        expect(result).toEqual(input);
      });

      it("should handle empty arrays", () => {
        const input: number[] = [];
        const result = shuffleArray(input);
        expect(result).toEqual([]);
      });

      it("should maintain the same reference when copy is false", () => {
        const input = [1, 2, 3];
        const originalReference = input;
        shuffleArray(input, false);
        expect(input).toBe(originalReference);
      });
    });

    describe("getRandomNumbersArray additional tests", () => {
      it("should handle min value equal to max value", () => {
        const result = getRandomNumbersArray(5, 5, 5);
        expect(result).toHaveLength(5);
        expect(result.every((num) => num === 4)).toBe(true);
      });

      it("should handle negative ranges", () => {
        const result = getRandomNumbersArray(5, 0, -5);
        expect(result).toHaveLength(5);
        result.forEach((num) => {
          expect(num).toBeGreaterThanOrEqual(-5);
          expect(num).toBeLessThan(0);
        });
      });

      it("should generate numbers with proper distribution", () => {
        // Testing if all possible values in range appear when generating large array
        const min = 1;
        const max = 6;
        const length = 1000;
        const result = getRandomNumbersArray(length, max, min);

        // Create a frequency map
        const frequencies = new Map<number, number>();
        for (let i = min; i < max; i++) {
          frequencies.set(i, 0);
        }

        // Count occurrences
        result.forEach((num) => {
          frequencies.set(num, (frequencies.get(num) || 0) + 1);
        });

        // Check if all values in range are present
        for (let i = min; i < max; i++) {
          expect(frequencies.get(i)).toBeGreaterThan(0);
        }

        // Check if the distribution is reasonably uniform (not an exact test)
        const expectedFrequency = length / (max - min);
        const tolerance = 0.5; // Allow 50% deviation from expected

        for (let i = min; i < max; i++) {
          const count = frequencies.get(i) || 0;
          expect(count).toBeGreaterThan(expectedFrequency * (1 - tolerance));
          expect(count).toBeLessThan(expectedFrequency * (1 + tolerance));
        }
      });
    });

    describe("Performance tests", () => {
      it("should handle large arrays efficiently for shuffleArray", () => {
        const largeArray = Array.from({ length: 10000 }, (_, i) => i);
        const startTime = performance.now();
        shuffleArray(largeArray);
        const duration = performance.now() - startTime;

        // Should complete in a reasonable time (adjust threshold as needed)
        expect(duration).toBeLessThan(100); // 100ms should be plenty
      });

      it("should handle large N efficiently for getRandomNElementsFromArray", () => {
        const largeArray = Array.from({ length: 1000 }, (_, i) => i);
        const startTime = performance.now();
        getRandomNElementsFromArray(largeArray, 500);
        const duration = performance.now() - startTime;

        expect(duration).toBeLessThan(50); // 50ms should be plenty
      });
    });
  });
});
