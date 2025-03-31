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

export function getRandomNumbersArray(length: number, max: number, min: number = 0) {
  const nums = [];

  for (let i = min; i < max; i++) nums.push(i);

  while (nums.length < length) {
    nums.push(...nums);
  }

  return shuffleArray(nums).slice(0, length);
}
