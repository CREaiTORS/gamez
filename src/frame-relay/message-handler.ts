import {
  ControlMessage,
  ErrorMessage,
  FrameRelayMessage,
  GameMessage,
  RequestMessage,
  SyncMessage,
} from "./message.interface";

/**
 * Abstract base class for handling frame relay messages
 * Provides type-safe method dispatch and extensible message handling
 */
export abstract class AbstractMessageHandler {
  /**
   * Processes system control messages (initialization, navigation)
   */
  abstract onControlMessage(message: ControlMessage): void | Promise<void>;

  /**
   * Handles error propagation between frames
   */
  abstract onErrorMessage(message: ErrorMessage): void | Promise<void>;

  /**
   * Processes game lifecycle commands
   */
  abstract onGameMessage(message: GameMessage): void | Promise<void>;

  /**
   * Handles data requests requiring responses
   */
  abstract onRequestMessage(message: RequestMessage): void | Promise<void>;

  /**
   * Processes state synchronization messages
   */
  abstract onSyncStateMessage(message: SyncMessage): void | Promise<void>;

  /**
   * Fallback handler for unrecognized message types
   */
  abstract onUnknownMessage(message: FrameRelayMessage): void | Promise<void>;
}

/**
 * Default implementation of message handler with no-op methods
 * Suitable for basic use cases or as a base for extension
 */
export class MessageHandler extends AbstractMessageHandler {
  onControlMessage(_message: ControlMessage): void {}

  onErrorMessage(_message: ErrorMessage): void {}

  onGameMessage(_message: GameMessage): void {}

  onRequestMessage(_message: RequestMessage): void {}

  onSyncStateMessage(_message: SyncMessage): void {}

  onUnknownMessage(_message: FrameRelayMessage): void {}
}
