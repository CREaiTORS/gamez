import {
  cleanupCommunication,
  initializeCommunication,
  sendMessageToParent,
  sendMessageToParentAsync,
} from "./communication";
import { AbstractMessageHandler } from "./message-handler";
import { MessageType } from "./message.interface";

/**
 * Configuration options for the communication hub
 */
export interface CommunicationHubConfig {
  /** Whether to enable debug logging */
  readonly enableLogging?: boolean;
  /** Timeout for initialization in milliseconds */
  readonly initializationTimeoutMs?: number;
}

/**
 * Central communication hub for iframe-to-parent messaging
 * Provides a high-level interface for establishing and managing
 * bidirectional communication between iframe and parent window
 */
export class CommunicationHub {
  private isInitialized: boolean = false;

  constructor(
    private readonly messageHandler: AbstractMessageHandler,
    private readonly config: CommunicationHubConfig = {}
  ) {}

  /**
   * Logs messages with hub prefix if logging is enabled
   */
  private log(...args: unknown[]): void {
    if (this.config.enableLogging !== false) {
      console.log("[CommunicationHub]:", ...args);
    }
  }

  /**
   * Establishes communication with the parent window
   * @returns Promise that resolves when communication is ready
   */
  async establishCommunication(): Promise<string[]> {
    if (this.isInitialized) {
      this.log("Communication already established");
      return [];
    }

    try {
      this.log("Establishing communication with parent window");
      const result = await initializeCommunication(this.messageHandler);
      this.isInitialized = true;
      this.log("Communication established successfully");
      return result;
    } catch (error) {
      this.log("Failed to establish communication:", error);
      throw error;
    }
  }

  /**
   * Terminates communication and cleans up resources
   */
  terminateCommunication(): void {
    if (!this.isInitialized) {
      this.log("Communication already terminated");
      return;
    }

    this.log("Terminating communication");
    cleanupCommunication();
    this.isInitialized = false;
  }

  /**
   * Sends a message to the parent window asynchronously
   * @param messageType - Type of message to send
   * @param method - Specific method within the message type
   * @param payload - Optional data payload
   * @returns Promise that resolves with the response
   */
  async sendAsyncMessage<TResponse>(messageType: MessageType, method: string, payload?: unknown[]): Promise<TResponse> {
    if (!this.isInitialized) {
      throw new Error("Communication not established. Call establishCommunication() first.");
    }

    this.log("Sending async message:", messageType, method, payload);
    return sendMessageToParentAsync<TResponse>(messageType, method, payload);
  }

  /**
   * Sends a message to the parent window with optional callback
   * @param messageType - Type of message to send
   * @param method - Specific method within the message type
   * @param payload - Optional data payload
   * @param callback - Optional callback for response handling
   */
  sendMessage(
    messageType: MessageType,
    method: string,
    payload?: unknown[],
    callback?: (response?: unknown) => void
  ): void {
    if (!this.isInitialized) {
      throw new Error("Communication not established. Call establishCommunication() first.");
    }

    this.log("Sending message:", messageType, method, payload);
    sendMessageToParent(messageType, method, payload, callback);
  }

  /**
   * Checks if communication is currently established
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // Legacy methods for backward compatibility
  /** @deprecated Use establishCommunication instead */
  async initialize(): Promise<string[]> {
    return this.establishCommunication();
  }

  /** @deprecated Use terminateCommunication instead */
  uninitialize(): void {
    this.terminateCommunication();
  }

  /** @deprecated Use sendAsyncMessage instead */
  sendMessageToParentAsync<TResponse>(
    ...args: Parameters<typeof sendMessageToParentAsync<TResponse>>
  ): Promise<TResponse> {
    return sendMessageToParentAsync<TResponse>(...args);
  }

  /** @deprecated Use sendMessage instead */
  sendMessageToParent(...args: Parameters<typeof sendMessageToParent>): void {
    sendMessageToParent(...args);
  }
}
