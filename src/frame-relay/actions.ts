import { getCommunicationHub } from "./hub-store";
import { MessageType, SystemControlMethod } from "./message.interface";

/**
 * Navigation actions for iframe communication
 * Provides high-level actions that can be called from within an iframe
 */
export class FrameRelayNavigationActions {
  /**
   * Requests the parent window to navigate back
   * Typically used when a game or iframe content wants to return to the previous view
   */
  static requestNavigateBack(): void {
    try {
      const hub = getCommunicationHub();
      if (!hub.isReady()) {
        console.warn("Cannot navigate back: Communication hub not ready");
        return;
      }

      hub.sendMessage(MessageType.CONTROL, SystemControlMethod.NAVIGATE_BACK);
    } catch (error) {
      console.error("Failed to request navigation back:", error);
    }
  }

  /**
   * Requests the parent window to navigate back with callback
   * @param onResponse - Callback to execute when parent responds
   */
  static requestNavigateBackWithCallback(onResponse?: (response?: unknown) => void): void {
    try {
      const hub = getCommunicationHub();
      if (!hub.isReady()) {
        console.warn("Cannot navigate back: Communication hub not ready");
        return;
      }

      hub.sendMessage(MessageType.CONTROL, SystemControlMethod.NAVIGATE_BACK, undefined, onResponse);
    } catch (error) {
      console.error("Failed to request navigation back:", error);
    }
  }

  /**
   * Requests the parent window to navigate back asynchronously
   * @returns Promise that resolves when navigation is confirmed
   */
  static async requestNavigateBackAsync(): Promise<unknown> {
    try {
      const hub = getCommunicationHub();
      if (!hub.isReady()) {
        throw new Error("Communication hub not ready");
      }

      return await hub.sendAsyncMessage(MessageType.CONTROL, SystemControlMethod.NAVIGATE_BACK);
    } catch (error) {
      console.error("Failed to request navigation back:", error);
      throw error;
    }
  }

  static async requestSessionCompleteAsync(): Promise<unknown> {
    try {
      const hub = getCommunicationHub();
      if (!hub.isReady()) {
        throw new Error("Communication hub not ready");
      }

      return await hub.sendAsyncMessage(MessageType.CONTROL, SystemControlMethod.SESSION_COMPLETE);
    } catch (error) {
      console.error("Failed to request session complete:", error);
      throw error;
    }
  }
}
