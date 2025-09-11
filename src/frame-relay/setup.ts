import { createCommunicationHub } from "./hub-store";
import { MessageHandler } from "./message-handler";

/**
 * Configuration options for frame relay setup
 */
export interface FrameRelaySetupConfig {
  /** Timeout for initialization in milliseconds */
  readonly initializationTimeoutMs?: number;
  /** Whether to enable debug logging */
  readonly enableLogging?: boolean;
}

/**
 * Sets up frame relay communication with the game service
 * Establishes bidirectional communication and integrates with GameService lifecycle
 *
 * @param messageHandler - The message handler instance to use
 * @param config - Optional configuration for setup
 * @returns Promise that resolves with the configured message handler when ready
 */
export async function initializeFrameRelay(
  messageHandler: MessageHandler,
  config: FrameRelaySetupConfig = {}
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    // Set timeout for initialization
    const timeoutMs = config.initializationTimeoutMs ?? 60000;
    const timeoutId = setTimeout(() => {
      reject(new Error(`Frame relay setup timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    // Create and initialize communication hub
    const communicationHub = createCommunicationHub(messageHandler, {
      enableLogging: config.enableLogging,
      initializationTimeoutMs: config.initializationTimeoutMs,
    });

    // Initialize communication
    communicationHub
      .establishCommunication()
      .then((value) => {
        communicationHub;
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Enhanced setup function with better error handling and configuration
 * @param messageHandler - The message handler instance to use
 * @param config - Configuration options for setup
 * @returns Promise that resolves with communication hub and message handler
 */
export async function setupAdvancedFrameRelay(
  messageHandler: MessageHandler,
  config: FrameRelaySetupConfig = {}
): Promise<{
  messageHandler: MessageHandler;
  communicationHub: ReturnType<typeof createCommunicationHub>;
}> {
  // Create communication hub
  const communicationHub = createCommunicationHub(messageHandler, {
    enableLogging: config.enableLogging,
    initializationTimeoutMs: config.initializationTimeoutMs,
  });

  try {
    // Establish communication
    await communicationHub.establishCommunication();

    return {
      messageHandler,
      communicationHub,
    };
  } catch (error) {
    // Clean up on failure
    communicationHub.terminateCommunication();
    throw error;
  }
}
