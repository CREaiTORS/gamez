import { useEffect } from "react";
import { GameService } from "../lib";

export function useSyncGameService(gs: GameService) {
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
