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
