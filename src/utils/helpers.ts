import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 *
 * @param time in milliseconds
 * @returns
 */
export function sleep(time: number) {
  return new Promise((res) => setTimeout(res, time));
}

/**
 *
 * @param startTime epoch time
 * @param delay in ms
 * @returns
 */
export function diffTime(startTime: number, delay = 0) {
  return (new Date().getTime() - startTime - delay) / 1000;
}
