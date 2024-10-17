export const randomNumbers = (length: number, max: number, min: number = 0) => {
  const nums = [];

  for (let i = min; i <= max; i++) nums.push(i);

  nums.sort(() => (Math.random() > 0.5 ? 1 : -1));

  return new Set(nums.slice(0, length));
};

export const randomNumbersArr = (length: number, max: number, min: number = 0) => {
  const nums = [];

  for (let i = min; i <= max; i++) nums.push(i);

  nums.sort(() => (Math.random() > 0.5 ? 1 : -1));

  return nums.slice(0, length);
};

export function randomElementFromArr(arr: any[]) {
  const l = arr.length;

  return arr[Math.round(Math.random() * (l - 1))];
}
