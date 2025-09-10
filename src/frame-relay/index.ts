// Core message handling
export * from "./message-handler";
export * from "./message.interface";

// Communication layer
export * from "./communication";
export * from "./helpers";

// High-level interfaces
export * from "./controller";
export * from "./hub";
export * from "./hub-store";

// Actions and setup
export * from "./actions";
export * from "./setup";

// Legacy type exports for backward compatibility
export type { FrameRelayMessage as Message } from "./message.interface";

export {
  SystemControlMethod as ControlMethod,
  GameLifecycleMethod as GameMethod,
  StateSynchronizationMethod as SyncState,
} from "./message.interface";

export { CommunicationHub as Hub } from "./hub";

export { IFrameController } from "./controller";
