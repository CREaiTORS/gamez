/**
 * Returns an array of N randomly selected elements from the input array.
 * @param arr - The input array to select elements from.
 * @param n - The number of elements to select.
 * @returns An array of three randomly selected elements from the input array.
 */
export function getRandomNElementsFromArray(arr: Array<any>, n: number) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

/**
 * Randomize the array
 * @param arr - The input array.
 * @param copy - create a copy of the array (default: true)
 * @returns An array of with elements at random positions.
 */
export function shuffleArray<T>(array: T[], copy: boolean = true) {
  return (copy ? [...array] : array).sort(() => Math.random() - 0.5);
}

export function getRandomElementFromArray<T>(arr: T[]) {
  return arr[Math.round(Math.random() * (arr.length - 1))];
}

/**
 *
 * @param length length of the array
 * @param max  upper bound, excluding this value
 * @param min lower bound
 * @returns array of random numbers between min and max
 */

/**
 * Generates an array of random numbers with a specified length.

 * @param length - The desired length of the resulting array
 * @param max - The exclusive upper limit for the generated numbers
 * @param min - The inclusive lower limit for the generated numbers (defaults to 0)
 * @returns An array of shuffled numbers with the specified length
 *
 * @example
 * // Returns an array of 5 random numbers between 0 and 9
 * getRandomNumbersArray(5, 10);
 *
 * @example
 * // Returns an array of 8 random numbers between 3 and 9
 * getRandomNumbersArray(8, 10, 3);
 */
export function getRandomNumbersArray(length: number, max: number, min: number = 0) {
  const nums = [];

  for (let i = min; i < max; i++) nums.push(i);

  while (nums.length && nums.length < length) {
    nums.push(...nums);
  }

  return shuffleArray(nums).slice(0, length);
}

/**
 * Compare two arrays for equality
 * @param a array a to compare
 * @param b array b to compare
 * @returns boolean
 */
export function compareArrays(a: any[], b: any[]) {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

/**
 * Rotates an array by k positions.
 *
 * @param array - The input array to be rotated
 * @param k - The number of positions to rotate the array by
 * @returns A new array with elements rotated by k positions
 *
 * @example
 * rotateArray([1, 2, 3, 4], 2);
 * // Returns [3, 4, 1, 2]
 *
 * @example
 * rotateArray([1, 2, 3], 1);
 * // Returns [3, 1, 2]
 *
 * @example
 * rotateArray([1, 2, 3, 4], -1);
 * // Returns [2, 3, 4, 1]
 */
export function rotateArray<T>(array: T[], k: number): T[] {
  if (array.length === 0) return [];

  // Normalize k to handle negative values and values larger than array length
  const normalizedK = ((k % array.length) + array.length) % array.length;

  // Use slice for efficient rotation
  return [...array.slice(normalizedK), ...array.slice(0, normalizedK)];
}
