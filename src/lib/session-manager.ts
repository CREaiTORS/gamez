/**
 * Session management utility for handling game session states and transitions
 */

import { ResultType } from "../types";
import { Logger } from "./logger";

export type SessionState = "initialized" | "active" | "paused" | "end";

export interface SessionManager {
  getSession(): SessionState;
  getResult(): ResultType;
  getSessionStartTime(): number;
  isSessionEnded(): boolean;
  startSession(): boolean;
  pauseSession(): boolean;
  resumeSession(): boolean;
  endSession(result: Exclude<ResultType, "">): boolean;
  resetSession(): void;
}

/**
 * Create a session manager instance
 */
export function createSessionManager(logger: Logger): SessionManager {
  let session: SessionState = "initialized";
  let result: ResultType = "";
  let sessionStartTime: number = 0;

  return {
    /**
     * Get the current session state
     */
    getSession(): SessionState {
      return session;
    },

    /**
     * Get the result of the current session
     */
    getResult(): ResultType {
      return result;
    },

    /**
     * Get the session start time
     */
    getSessionStartTime(): number {
      return sessionStartTime;
    },

    /**
     * Check if the current session has ended
     */
    isSessionEnded(): boolean {
      return session === "end";
    },

    /**
     * Start the game session
     * Changes session state to "active"
     */
    startSession(): boolean {
      if (session !== "initialized") {
        logger.warn("reset session before starting");
        return false;
      }

      session = "active";
      sessionStartTime = Date.now();
      return true;
    },

    /**
     * Pause the game session
     * Changes session state to "paused"
     */
    pauseSession(): boolean {
      if (session !== "active") {
        logger.warn(`Cannot pause session: current state is '${session}', expected 'active'`);
        return false;
      }

      session = "paused";
      return true;
    },

    /**
     * Resume a paused game session
     * Changes session state to "active"
     */
    resumeSession(): boolean {
      if (session !== "paused") {
        logger.warn(`Cannot resume session: current state is '${session}', expected 'paused'`);
        return false;
      }

      session = "active";
      return true;
    },

    /**
     * End the current session with a result
     */
    endSession(sessionResult: Exclude<ResultType, "">): boolean {
      if (session === "end") {
        logger.warn("Session is already ended");
        return false;
      }

      if (session === "initialized") {
        logger.warn("Cannot end session that hasn't been started");
        return false;
      }

      session = "end";
      result = sessionResult;
      return true;
    },

    /**
     * Reset the session to initial state
     */
    resetSession(): void {
      session = "initialized";
      sessionStartTime = 0;
      result = "";
    },
  };
}

/**
 * Session validation utilities
 */
export const sessionUtils = {
  /**
   * Check if a session state is valid
   */
  isValidSessionState(state: string): state is SessionState {
    return ["initialized", "active", "paused", "end"].includes(state);
  },

  /**
   * Get valid transitions from a given state
   */
  getValidTransitions(currentState: SessionState): SessionState[] {
    const transitions: Record<SessionState, SessionState[]> = {
      initialized: ["active"],
      active: ["paused", "end"],
      paused: ["active", "end"],
      end: ["initialized"], // Only through reset
    };

    return transitions[currentState] || [];
  },

  /**
   * Check if a transition is valid
   */
  isValidTransition(from: SessionState, to: SessionState): boolean {
    const validTransitions = sessionUtils.getValidTransitions(from);
    return validTransitions.includes(to);
  },

  /**
   * Calculate session duration
   */
  calculateSessionDuration(startTime: number, endTime?: number): number {
    const end = endTime || Date.now();
    return Math.max(0, end - startTime);
  },
};
