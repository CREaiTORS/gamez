/**
 * Returns an array of N randomly selected elements from the input array.
 * @param arr - The input array to select elements from.
 * @param n - The number of elements to select.
 * @returns An array of three randomly selected elements from the input array.
 */
export function getRandomNElements(arr: Array<any>, n: number) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array - The array to shuffle.
 * @returns The shuffled array.
 * @typeParam T - The type of elements in the array.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = JSON.parse(JSON.stringify(array)) as T[];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
}
