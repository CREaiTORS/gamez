/**
 * Converts seconds to mm:ss format
 * @param seconds The time in seconds to format
 * @returns The formatted time in mm:ss format
 */
export function formatTime(seconds: number): string {
  // Calculate the number of minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Format the time as mm:ss
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Calculate the time difference between a start time and now
 * @param startTime - The starting epoch time in milliseconds
 * @param delay - Additional delay to subtract in milliseconds (default: 0)
 * @returns Time difference in seconds
 *
 * @example
 * const start = Date.now();
 * // ... some time passes
 * const elapsed = diffTime(start); // Returns seconds elapsed
 *
 * @example
 * // With delay compensation
 * const elapsed = diffTime(start, 500); // Subtracts 500ms from calculation
 */
export function diffTime(startTime: number, delay = 0): number {
  return (Date.now() - startTime - delay) / 1000;
}

/**
 * Format time difference as a human-readable string
 * @param startTime - The starting epoch time in milliseconds
 * @param delay - Additional delay to subtract in milliseconds (default: 0)
 * @returns Formatted time string (e.g., "2.5s", "1m 30s", "1h 2m")
 */
export function formatDiffTime(startTime: number, delay = 0): string {
  const seconds = diffTime(startTime, delay);

  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
