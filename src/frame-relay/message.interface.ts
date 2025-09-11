/**
 * Message types for frame relay communication
 * Each type represents a different category of inter-frame communication
 */
export enum MessageType {
  /** System control messages (initialization, navigation) */
  CONTROL = "control",
  /** Error reporting and propagation */
  ERROR = "error",
  /** Game command messages */
  GAME = "game",
  /** Data request/response messages */
  REQUEST = "request",
  /** State synchronization messages */
  SYNC = "sync",
}

/**
 * Game-specific methods for controlling game
 */
export enum GameMethod {
  START_SESSION = "start",
  STOP_SESSION = "stop",
  END_SESSION = "end",
  COLLECT_REPORT = "report",
}

/**
 * Control methods for system-level operations
 */
export enum SystemControlMethod {
  INITIALIZE_CONNECTION = "init",
  NAVIGATE_BACK = "back",
}

/**
 * State synchronization methods for keeping parent and child in sync
 */
export enum StateSynchronizationMethod {
  SYNC_LEVELS = "levels",
  SYNC_CURRENT_LEVEL = "currLevel",
}

/**
 * Union type for all possible method values
 */
export type MessageMethod = GameMethod | SystemControlMethod | StateSynchronizationMethod;

/**
 * Core message structure for frame relay communication
 * All communication between parent and child frames uses this structure
 */
export interface FrameRelayMessage {
  /** Unique identifier for request/response correlation */
  readonly id?: string;
  /** Message category determining how it should be processed */
  readonly type: MessageType;
  /** Specific action within the message type */
  readonly method?: MessageMethod;
  /** Human-readable description for debugging */
  readonly text?: string;
  /** Typed payload data */
  readonly payload?: unknown;
}

/**
 * Type-safe message variants for specific use cases
 */
export interface ControlMessage extends FrameRelayMessage {
  readonly type: MessageType.CONTROL;
  readonly method: SystemControlMethod;
}

export interface GameMessage extends FrameRelayMessage {
  readonly type: MessageType.GAME;
  readonly method: GameMethod;
}

export interface SyncMessage extends FrameRelayMessage {
  readonly type: MessageType.SYNC;
  readonly method: StateSynchronizationMethod;
}

export interface ErrorMessage extends FrameRelayMessage {
  readonly type: MessageType.ERROR;
  readonly text: string;
  readonly payload: {
    readonly error: string;
    readonly stack?: string;
    readonly timestamp: number;
  };
}

export interface RequestMessage extends FrameRelayMessage {
  readonly type: MessageType.REQUEST;
  readonly id: string;
}
