import { AbstractMessageHandler } from "./message-handler";
import {
  GameMethod,
  MessageMethod,
  MessageType,
  SystemControlMethod,
  type FrameRelayMessage,
} from "./message.interface";

/**
 * Lifecycle states for iframe management
 * Represents the progression from creation to full initialization
 */
export enum IFrameLifecycleState {
  /** Initial state when controller is created */
  BOOTSTRAPPED = "bootstrapped",
  /** Iframe DOM element is loaded and accessible */
  CONTENT_LOADED = "loaded",
  /** Communication handshake completed */
  COMMUNICATION_READY = "initialized",
}

/**
 * Configuration options for iframe initialization
 */
export interface IFrameControllerConfig {
  /** Timeout in milliseconds for iframe initialization */
  readonly initializationTimeoutMs?: number;
  /** Whether to enable debug logging */
  readonly enableLogging?: boolean;
}

/**
 * Manages iframe lifecycle and parent-to-child communication
 * Handles iframe initialization, message routing, and lifecycle management
 */
export class IFrameController {
  private lifecycleState: IFrameLifecycleState = IFrameLifecycleState.BOOTSTRAPPED;
  private targetWindow: Window | null = null;
  private targetOrigin: string | null = null;
  private messageEventListener: ((event: MessageEvent) => void) | null = null;

  constructor(
    private readonly messageHandler: AbstractMessageHandler,
    private readonly config: IFrameControllerConfig = {}
  ) {}

  /**
   * Logs messages with controller prefix if logging is enabled
   */
  private log(...args: unknown[]): void {
    if (this.config.enableLogging !== false) {
      console.log("[IFrameController]:", ...args);
    }
  }

  /**
   * Logs warning messages with controller prefix
   */
  private warn(...args: unknown[]): void {
    console.warn("[IFrameController]:", ...args);
  }

  /**
   * Initializes the iframe and establishes communication
   * @param iframeElement - The iframe DOM element to control
   * @returns Promise that resolves when initialization is complete
   */
  async initializeIFrame(iframeElement: HTMLIFrameElement): Promise<void> {
    this.log("Initializing iframe communication");

    if (this.lifecycleState === IFrameLifecycleState.BOOTSTRAPPED) {
      this.configureIFrameTarget(iframeElement);
      this.lifecycleState = IFrameLifecycleState.CONTENT_LOADED;
    }

    if (this.lifecycleState === IFrameLifecycleState.COMMUNICATION_READY) {
      this.log("Iframe already initialized");
      return;
    }

    if (this.lifecycleState === IFrameLifecycleState.CONTENT_LOADED) {
      return this.establishCommunication();
    }

    throw new Error(`Unexpected iframe lifecycle state: ${this.lifecycleState}`);
  }

  /**
   * Configures the target window and origin from iframe element
   */
  private configureIFrameTarget(iframeElement: HTMLIFrameElement): void {
    this.targetOrigin = iframeElement.src;
    this.targetWindow = iframeElement.contentWindow;

    if (!this.targetWindow) {
      throw new Error("Iframe content window is not accessible");
    }
  }

  /**
   * Establishes communication handshake with the iframe
   */
  private establishCommunication(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.targetWindow) {
        reject(new Error("Target window is not available"));
        return;
      }

      const timeoutMs = this.config.initializationTimeoutMs ?? 30000;
      const timeoutId = setTimeout(() => {
        reject(new Error(`Iframe initialization timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      // Set up one-time listener for initialization handshake
      const handshakeListener = (event: MessageEvent) => {
        const parseResult = this.parseIncomingMessage(event.data);

        if (
          parseResult.success &&
          parseResult.message?.type === MessageType.CONTROL &&
          parseResult.message?.method === SystemControlMethod.INITIALIZE_CONNECTION
        ) {
          clearTimeout(timeoutId);
          this.lifecycleState = IFrameLifecycleState.COMMUNICATION_READY;

          // Set up persistent message listener
          this.messageEventListener = this.createMessageEventListener();
          window.addEventListener("message", this.messageEventListener);

          // Acknowledge the handshake
          this.sendMessage(MessageType.CONTROL, {
            method: SystemControlMethod.INITIALIZE_CONNECTION,
            id: parseResult.message.id,
          });

          this.log("Communication established with iframe");
          resolve();
        }
      };

      window.addEventListener("message", handshakeListener, { once: true });
    });
  }

  /**
   * Creates the persistent message event listener
   */
  private createMessageEventListener(): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
      try {
        const parseResult = this.parseIncomingMessage(event.data);
        if (!parseResult.success || !parseResult.message) {
          return;
        }

        this.routeMessageToHandler(parseResult.message);
      } catch (error) {
        this.warn("Error handling message from iframe:", error);
      }
    };
  }

  /**
   * Routes parsed messages to the appropriate handler method
   */
  private async routeMessageToHandler(message: FrameRelayMessage): Promise<void> {
    switch (message.type) {
      case MessageType.CONTROL:
        await this.messageHandler.onControlMessage(message as any);
        break;
      case MessageType.ERROR:
        await this.messageHandler.onErrorMessage(message as any);
        break;
      case MessageType.GAME:
        await this.messageHandler.onGameMessage(message as any);
        break;
      case MessageType.REQUEST:
        await this.messageHandler.onRequestMessage(message as any);
        break;
      case MessageType.SYNC:
        await this.messageHandler.onSyncStateMessage(message as any);
        break;
      default:
        await this.messageHandler.onUnknownMessage(message);
    }
  }

  /**
   * Sends a message to the iframe
   */
  private sendMessage(type: MessageType, messageData?: Partial<FrameRelayMessage>): void {
    if (!this.targetWindow || !this.targetOrigin) {
      this.warn("Cannot send message: target window or origin not available");
      return;
    }

    const message: FrameRelayMessage = {
      type,
      ...messageData,
    };

    this.targetWindow.postMessage(JSON.stringify(message), this.targetOrigin);
    this.log("Sent message to iframe:", message);
  }

  /**
   * Safely parses incoming message data
   */
  private parseIncomingMessage(data: unknown): { success: boolean; message?: FrameRelayMessage } {
    try {
      if (typeof data !== "string") {
        return { success: false };
      }

      const parsed = JSON.parse(data) as FrameRelayMessage;
      return { success: true, message: parsed };
    } catch {
      return { success: false };
    }
  }

  /**
   * Starts the game session in the iframe
   */
  public startGameSession(): void {
    this.log("Starting game session");
    this.sendMessage(MessageType.GAME, {
      method: GameMethod.START_SESSION,
    });
  }

  /**
   * Stops the game session in the iframe
   */
  public endGameSession(): void {
    this.log("Stopping game session");
    this.sendMessage(MessageType.GAME, {
      method: GameMethod.END_SESSION,
    });
  }

  /**
   * Synchronizes state between parent and iframe
   * @param synchronizationMethod - The type of state to synchronize
   * @param payload - The state data to send
   */
  public synchronizeState(synchronizationMethod: MessageMethod, payload: unknown): void {
    this.log("Synchronizing state:", synchronizationMethod, payload);
    this.sendMessage(MessageType.SYNC, {
      method: synchronizationMethod,
      payload,
    });
  }

  /**
   * Terminates the iframe and cleans up resources
   */
  public terminateIFrame(): void {
    this.log("Terminating iframe");

    // Clean up event listener
    if (this.messageEventListener) {
      window.removeEventListener("message", this.messageEventListener);
      this.messageEventListener = null;
    }

    // Close iframe window if possible
    if (this.targetWindow) {
      try {
        this.targetWindow.close();
      } catch (error) {
        this.warn("Could not close iframe window:", error);
      }
    }

    // Reset state
    this.targetWindow = null;
    this.targetOrigin = null;
    this.lifecycleState = IFrameLifecycleState.BOOTSTRAPPED;
  }

  /**
   * Gets the current lifecycle state of the iframe
   */
  public getLifecycleState(): IFrameLifecycleState {
    return this.lifecycleState;
  }

  /**
   * Checks if the iframe is ready for communication
   */
  public isReady(): boolean {
    return this.lifecycleState === IFrameLifecycleState.COMMUNICATION_READY;
  }
}
