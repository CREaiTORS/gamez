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
  return (Date.now() - startTime - delay) / 1000;
}

export function vibrate(duration = 100) {
  try {
    navigator.vibrate(duration);
  } catch {}
}

export function moveSVGPath(d: string, x: number, y: number) {
  let regexp = /([a-zA-Z])([\s\d\-\.]*)/g;
  return [...d.matchAll(regexp)]
    .map((command) => {
      let arr = command[2]
        .trim()
        .split(/\s/)
        .map((val) => parseFloat(val));
      let return_arr = arr;
      switch (command[1]) {
        case "M":
        case "L":
        case "H":
        case "V":
        case "Q":
        case "T":
          return_arr = [arr[0] + x, arr[1] + y];
          break;
        case "z":
        case "Z":
          return_arr = [];
          break;
      }
      return `${command[1]}${return_arr.join(" ")}`;
    })
    .join(" ");
}
