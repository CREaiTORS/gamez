/**
 * Event tracking utility for recording game events and metadata
 */

import { diffTime } from "../utils";

export interface GameEvent {
  event: string;
  metadata: any;
  time: number;
}

export interface EventTracker {
  track(event: string, metadata?: any): void;
  getEvents(): GameEvent[];
  clearEvents(): void;
  getEventCount(): number;
  getEventsByType(eventType: string): GameEvent[];
}

/**
 * Create an event tracker instance
 */
export function createEventTracker(getSessionStartTime: () => number): EventTracker {
  let events: GameEvent[] = [];

  return {
    /**
     * Track an event with metadata
     */
    track(event: string, metadata: any = {}): void {
      events.push({
        event,
        metadata,
        time: diffTime(getSessionStartTime()),
      });
    },

    /**
     * Get all tracked events
     */
    getEvents(): GameEvent[] {
      return [...events]; // Return a copy to prevent external mutations
    },

    /**
     * Clear all tracked events
     */
    clearEvents(): void {
      events = [];
    },

    /**
     * Get the total number of tracked events
     */
    getEventCount(): number {
      return events.length;
    },

    /**
     * Get events filtered by event type
     */
    getEventsByType(eventType: string): GameEvent[] {
      return events.filter((event) => event.event === eventType);
    },
  };
}

/**
 * Event aggregation utilities
 */
export const eventUtils = {
  /**
   * Group events by type
   */
  groupEventsByType(events: GameEvent[]): Record<string, GameEvent[]> {
    return events.reduce((acc, event) => {
      if (!acc[event.event]) {
        acc[event.event] = [];
      }
      acc[event.event].push(event);
      return acc;
    }, {} as Record<string, GameEvent[]>);
  },

  /**
   * Get events within a time range
   */
  getEventsInTimeRange(events: GameEvent[], startTime: number, endTime: number): GameEvent[] {
    return events.filter((event) => event.time >= startTime && event.time <= endTime);
  },

  /**
   * Calculate event frequency per time unit
   */
  calculateEventFrequency(events: GameEvent[], timeUnit: number = 1000): number {
    if (events.length === 0) return 0;

    const totalTime = Math.max(...events.map((e) => e.time)) - Math.min(...events.map((e) => e.time));
    return (events.length / totalTime) * timeUnit;
  },
};
