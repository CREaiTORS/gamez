import { GameService } from "../lib/game-service";
import { createCommunicationHub } from "./hub-store";
import { MessageHandler } from "./message-handler";
import { FrameRelayMessage, StateSynchronizationMethod } from "./message.interface";

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
 * Game service message handler for frame relay communication
 * Integrates GameService with the frame relay system
 */
class GameServiceMessageHandler extends MessageHandler {
  constructor(private readonly gameService: GameService) {
    super();
  }

  override onSyncStateMessage(message: FrameRelayMessage): void {
    if (message.method === StateSynchronizationMethod.SYNC_CURRENT_LEVEL) {
      this.gameService.setCurrLevel(message.payload as number);
    } else if (message.method === StateSynchronizationMethod.SYNC_LEVELS) {
      const { idx, level } = message.payload as { idx: number; level: unknown };
      this.gameService.levels[idx] = level as any;
    }
  }
}

/**
 * Sets up frame relay communication with the game service
 * Establishes bidirectional communication and integrates with GameService lifecycle
 *
 * @param gameService - The game service instance to integrate with
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
 * @param gameService - The game service instance to integrate with
 * @param config - Configuration options for setup
 * @returns Promise that resolves with communication hub and message handler
 */
export async function setupAdvancedFrameRelay(
  gameService: GameService,
  config: FrameRelaySetupConfig = {}
): Promise<{
  messageHandler: MessageHandler;
  communicationHub: ReturnType<typeof createCommunicationHub>;
}> {
  const messageHandler = new GameServiceMessageHandler(gameService);

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
