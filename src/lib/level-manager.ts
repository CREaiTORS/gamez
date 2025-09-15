/**
 * Level management utility for handling game level progression and navigation
 */

import { Logger } from "./logger";

export interface LevelManager {
  readonly levels: any[];
  readonly currentLevel: number;

  getCurrLevel(): number;
  isGameComplete(): boolean;
  getCurrLevelDetails<T>(): T;
  nextLevel(): boolean;
  setCurrLevel(level: number): boolean;
}

/**
 * Create a level manager instance
 */
export function createLevelManager(levels: any[], logger: Logger): LevelManager {
  // 0 based index
  let currLevel = 0;

  return {
    get levels() {
      return levels;
    },
    get currentLevel() {
      return currLevel;
    },

    /**
     * Get the current level index
     */
    getCurrLevel() {
      return currLevel;
    },

    /**
     * Check if all levels are completed
     */
    isGameComplete() {
      return currLevel >= levels.length;
    },

    /**
     * Get the details of the current level
     */
    getCurrLevelDetails<T>() {
      return levels[currLevel] as T;
    },

    /**
     * Advance to the next level
     * @returns true if successfully advanced, false if already at last level
     */
    nextLevel(): boolean {
      const newLevel = currLevel + 1;
      if (newLevel >= levels.length) {
        logger.warn("Already at the last level, cannot advance further");
        return false;
      }

      currLevel = newLevel;
      logger.debug(`Advanced to level ${currLevel + 1}/${levels.length}`);
      return true;
    },

    /**
     * Set the current level index
     */
    setCurrLevel(level: number): boolean {
      if (level < 0 || level >= levels.length) {
        logger.warn(`Invalid level index ${level}. Valid range: 0-${levels.length - 1}`);
        return false;
      }

      currLevel = level;
      logger.debug(`Set current level to ${level + 1}/${levels.length}`);
      return true;
    },
  };
}

/**
 * Validate level configuration array
 */
export function validateLevels(levels: any[]): boolean {
  if (!Array.isArray(levels)) {
    return false;
  }

  if (levels.length === 0) {
    return false;
  }

  return true;
}
