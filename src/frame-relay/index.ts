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

export {
  SystemControlMethod as ControlMethod,
  GameLifecycleMethod as GameMethod,
  StateSynchronizationMethod as SyncState,
} from "./message.interface";

export { CommunicationHub as Hub } from "./hub";

export { IFrameController } from "./controller";
