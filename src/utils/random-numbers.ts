/**
 *
 * @param max upper bound, excluding this value
 * @param min lower bound
 * @returns
 */
export function getRandomNum(max: number, min = 0) {
  return (Math.round(Math.random() * (max - min)) % (max - min)) + min;
}

/**
 * Randomize the array
 * @param arr - The input array.
 * @param copy - create a copy of the array (default: true)
 * @returns An array of with elements at random positions.
 */
export function randomizeArray<T>(array: T[], copy: boolean = true) {
  return (copy ? [...array] : array).sort(() => Math.random() - 0.5);
}

/**
 *
 * @param length length of the array
 * @param max  upper bound
 * @param min lower bound
 * @returns array of random numbers between min and max
 */

export function randomNumbersArr(length: number, max: number, min: number = 0) {
  const nums = [];

  for (let i = min; i <= max; i++) nums.push(i);

  while (nums.length < length) {
    nums.push(...nums);
  }

  randomizeArray(nums, true);

  return nums.slice(0, length);
}

export function randomElementFromArr(arr: any[]) {
  return arr[Math.round(Math.random() * (arr.length - 1))];
}

export const randomNumbers = (length: number, max: number, min: number = 0) => {
  return new Set(randomNumbersArr(length, max, min));
};
