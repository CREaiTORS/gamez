/**
 *
 * @param max upper bound, excluding this value
 * @param min lower bound
 * @returns
 */
export function getRandomNum(max: number, min = 0) {
  return (Math.round(Math.random() * (max - min)) % (max - min)) + min;
}

export function randomNumbersArr(length: number, max: number, min: number = 0) {
  const nums = [];

  for (let i = min; i <= max; i++) nums.push(i);

  nums.sort(() => 0.5 - Math.random());

  return nums.slice(0, length);
}

export function randomElementFromArr(arr: any[]) {
  return arr[Math.round(Math.random() * (arr.length - 1))];
}

export const randomNumbers = (length: number, max: number, min: number = 0) => {
  return new Set(randomNumbersArr(length, max, min));
};
