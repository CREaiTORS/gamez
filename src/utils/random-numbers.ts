import { getRandomNumbersArray } from "./arrays";

/**
 *
 * @param max upper bound, excluding this value
 * @param min lower bound
 * @returns
 */
export function getRandomNum(max: number, min = 0) {
  return (Math.round(Math.random() * (max - min)) % (max - min)) + min;
}

export function getRandomNumbers(length: number, max: number, min: number = 0) {
  return new Set(getRandomNumbersArray(length, max, min));
}

/**
 * Generates a random floating-point number between min (inclusive) and max (exclusive).
 * @param max upper bound, excluding this value
 * @param min lower bound
 * @returns
 */
export function getRandomFloat(max: number, min = 0) {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a random boolean value.
 * @returns
 */
export function getRandomBoolean() {
  return Math.random() < 0.5;
}
