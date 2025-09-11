import { extractParentOrigin, getSecureWindowReference, parseIncomingMessage, validateTrustedOrigin } from "./helpers";
import { AbstractMessageHandler } from "./message-handler";
import { FrameRelayMessage, MessageType, SystemControlMethod } from "./message.interface";

/**
 * Communication state management and window references
 * Maintains the connection state between parent and child windows
 */
export class CommunicationState {
  public currentWindow: Window | null = null;
  public parentOrigin: string | null = null;
  public parentWindow: Window | null = null;
  public messageQueue: FrameRelayMessage[] = [];
  public nextMessageId: number = 0;
  public pendingCallbacks: Map<string, (response?: unknown) => void> = new Map();
  public messageListener: ((event: MessageEvent) => void) | null = null;

  /**
   * Resets all communication state to initial values
   */
  public reset(): void {
    this.currentWindow = null;
    this.parentOrigin = null;
    this.parentWindow = null;
    this.messageQueue = [];
    this.nextMessageId = 0;
    this.pendingCallbacks.clear();
    this.messageListener = null;
  }

  /**
   * Generates a unique message identifier
   */
  public generateMessageId(): string {
    return (this.nextMessageId++).toString();
  }
}

/**
 * Singleton instance for global communication state
 */
const communicationState = new CommunicationState();

/**
 * Initializes communication between child iframe and parent window
 * Establishes the message listener and attempts parent handshake
 * @param messageHandler - Handler for processing incoming messages
 * @returns Promise that resolves when communication is established
 */
export async function initializeCommunication(messageHandler: AbstractMessageHandler): Promise<unknown> {
  try {
    communicationState.currentWindow = getSecureWindowReference();

    const parentWindow = detectParentWindow(communicationState.currentWindow);
    if (!parentWindow) {
      throw new Error("Failed to initialize communication: No parent window detected");
    }

    communicationState.parentWindow = parentWindow;

    // Set up message listener before attempting handshake
    communicationState.messageListener = createIncomingMessageListener(messageHandler);
    communicationState.currentWindow.addEventListener("message", communicationState.messageListener, false);

    // Attempt handshake with parent
    communicationState.parentOrigin = extractParentOrigin();

    return sendMessageToParentAsync(MessageType.CONTROL, SystemControlMethod.INITIALIZE_CONNECTION);
  } catch (error) {
    // Clean up on failure
    cleanupCommunication();
    throw error;
  } finally {
    // Clear temporary parent origin after handshake attempt
    if (communicationState.parentOrigin === "*") {
      communicationState.parentOrigin = null;
    }
  }
}

/**
 * Detects the parent window (either iframe parent or window opener)
 */
function detectParentWindow(currentWindow: Window): Window | null {
  // Check if we're in an iframe
  if (currentWindow.parent !== currentWindow.self) {
    return currentWindow.parent;
  }

  // Check if we were opened by another window
  if (currentWindow.opener) {
    return currentWindow.opener;
  }

  return null;
}

/**
 * Cleans up communication resources and event listeners
 */
export function cleanupCommunication(): void {
  if (communicationState.currentWindow && communicationState.messageListener) {
    communicationState.currentWindow.removeEventListener("message", communicationState.messageListener, false);
  }

  communicationState.reset();
}

/**
 * Sends a message to the parent window and returns a Promise for the response
 * @param messageType - The type of message to send
 * @param methodName - The specific method within the message type
 * @param payload - Optional data payload
 * @returns Promise that resolves with the response
 */
export async function sendMessageToParentAsync<TResponse>(
  messageType: MessageType,
  methodName: string,
  payload?: unknown
): Promise<TResponse> {
  const message = createOutgoingMessage(messageType, methodName, payload);

  return new Promise<TResponse>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      communicationState.pendingCallbacks.delete(message.id!);
      reject(new Error(`Message timeout: ${messageType}:${methodName}`));
    }, 10000); // 10 second timeout

    communicationState.pendingCallbacks.set(message.id!, (response?: unknown) => {
      clearTimeout(timeoutId);
      resolve(response as TResponse);
    });

    dispatchMessageToParent(message);
  });
}

/**
 * Sends a message to the parent window with optional callback
 * @param messageType - The type of message to send
 * @param methodName - The specific method within the message type
 * @param payload - Optional data payload
 * @param callback - Optional callback for response handling
 */
export function sendMessageToParent(
  messageType: MessageType,
  methodName: string,
  payload?: unknown,
  callback?: (response?: unknown) => void
): void {
  const message = createOutgoingMessage(messageType, methodName, payload);

  if (callback) {
    communicationState.pendingCallbacks.set(message.id!, callback);
  }

  dispatchMessageToParent(message);
}

/**
 * Creates a properly formatted outgoing message
 */
function createOutgoingMessage(messageType: MessageType, methodName: string, payload?: unknown): FrameRelayMessage {
  return {
    id: communicationState.generateMessageId(),
    type: messageType,
    method: methodName as any, // Type assertion needed due to union complexity
    payload,
  };
}

/**
 * Dispatches a message to the parent window or queues it if parent is not ready
 */
function dispatchMessageToParent(message: FrameRelayMessage): void {
  if (communicationState.parentWindow && communicationState.parentOrigin) {
    console.log("Sending message to parent:", message, communicationState.parentOrigin);
    communicationState.parentWindow.postMessage(JSON.stringify(message), communicationState.parentOrigin);
  } else {
    console.log("Queueing message (parent not ready):", message);
    communicationState.messageQueue.push(message);
  }
}

/**
 * Creates the message listener function for handling incoming messages
 */
function createIncomingMessageListener(messageHandler: AbstractMessageHandler) {
  return async function handleIncomingMessage(event: MessageEvent): Promise<void> {
    // Validate message structure and origin
    if (!shouldProcessMessage(event.source, event.origin)) {
      console.warn("Message rejected from untrusted source:", event.origin);
      return;
    }
    const parseResult = parseIncomingMessage(event);
    if (!parseResult.success) {
      console.warn("Failed to parse incoming message:", parseResult.error);
      return;
    }

    // Update parent relationship if needed
    updateParentRelationship(event.source as Window, event.origin);

    // Process message if it's from the parent window
    if (event.source === communicationState.parentWindow) {
      await processParentMessage(parseResult.message!, messageHandler);
    }
  };
}

/**
 * Determines if a message should be processed based on source and origin validation
 */
function shouldProcessMessage(messageSource: MessageEventSource | null, messageOrigin: string): boolean {
  // Ignore messages from self
  if (communicationState.currentWindow && messageSource === communicationState.currentWindow) {
    return false;
  }

  // Allow messages from same origin
  if (communicationState.currentWindow?.location?.origin === messageOrigin) {
    return true;
  }

  // Validate against trusted origins
  try {
    const originUrl = new URL(messageOrigin);
    return validateTrustedOrigin(originUrl);
  } catch (error) {
    console.warn("Invalid message origin:", messageOrigin, error);
    return false;
  }
}

/**
 * Processes a validated message from the parent window
 */
async function processParentMessage(message: FrameRelayMessage, messageHandler: AbstractMessageHandler): Promise<void> {
  // Handle callback responses
  if (message.id && communicationState.pendingCallbacks.has(message.id)) {
    const callback = communicationState.pendingCallbacks.get(message.id)!;
    communicationState.pendingCallbacks.delete(message.id);
    callback(message.payload);
    return;
  }

  // Route message to appropriate handler
  try {
    switch (message.type) {
      case MessageType.CONTROL:
        await messageHandler.onControlMessage(message as any);
        break;
      case MessageType.ERROR:
        await messageHandler.onErrorMessage(message as any);
        break;
      case MessageType.GAME:
        await messageHandler.onGameMessage(message as any);
        break;
      case MessageType.REQUEST:
        await messageHandler.onRequestMessage(message as any);
        break;
      case MessageType.SYNC:
        await messageHandler.onSyncStateMessage(message as any);
        break;
      default:
        await messageHandler.onUnknownMessage(message);
    }
  } catch (error) {
    console.error("Error processing parent message:", error, message);
  }
}

/**
 * Updates the parent window relationship and flushes queued messages
 */
function updateParentRelationship(messageSource: Window, messageOrigin: string): void {
  const needsUpdate =
    !communicationState.parentWindow ||
    communicationState.parentWindow.closed ||
    messageSource === communicationState.parentWindow;

  if (needsUpdate) {
    communicationState.parentWindow = messageSource;
    communicationState.parentOrigin = messageOrigin;
  }

  // Clean up closed parent references
  if (communicationState.parentWindow?.closed) {
    communicationState.parentWindow = null;
    communicationState.parentOrigin = null;
    return;
  }

  // Flush any queued messages
  flushQueuedMessages();
}

/**
 * Sends all queued messages when parent connection becomes available
 */
function flushQueuedMessages(): void {
  if (
    !communicationState.parentWindow ||
    !communicationState.parentOrigin ||
    communicationState.messageQueue.length === 0
  ) {
    return;
  }

  while (communicationState.messageQueue.length > 0) {
    const queuedMessage = communicationState.messageQueue.shift();
    if (queuedMessage) {
      console.log("Flushing queued message:", queuedMessage);
      communicationState.parentWindow.postMessage(JSON.stringify(queuedMessage), communicationState.parentOrigin);
    }
  }
}
