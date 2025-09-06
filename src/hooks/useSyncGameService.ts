import { useEffect } from "react";
import { useGameService } from "../contexts/game-service-context";

/**
 * Hook to synchronize the game service session with the component lifecycle.
 * Automatically resumes the session on mount and pauses it on unmount.
 */
export function useSyncGameService() {
  const gs = useGameService();

  useEffect(() => {
    const session = gs.getSession();
    // Resume the session if it is not already active
    if (session !== "active") {
      gs.resumeSession();
      gs.track("Session Resumed");
    }

    return () => {
      const session = gs.getSession();
      if (session !== "paused") {
        // Pause the session if it is not already paused
        gs.pauseSession();
        gs.track("Session Paused");
      }
    };
  }, []);
}
