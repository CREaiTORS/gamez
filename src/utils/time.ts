export const SECONDS_IN_MINUTE = 60;

/**
 * Converts seconds to mm:ss format
 * @param seconds The time in seconds to format
 * @returns The formatted time in mm:ss format
 */
export function formatTime(seconds: number): string {
  // Calculate the number of minutes and seconds
  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const remainingSeconds = seconds % SECONDS_IN_MINUTE;

  // Format the time as mm:ss
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Calculates the time per order based on the level of the order.
 * @param level - The level of the order.
 * @returns The time per order in milliseconds.
 */
export function getTimePerOrder(level: number) {
  return (12 - 2 * level) * 1000; // Converted to milliseconds
}
