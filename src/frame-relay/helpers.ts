import { type FrameRelayMessage } from "./message.interface";

/**
 * Parsing result for message deserialization
 */
export interface MessageParseResult {
  readonly success: boolean;
  readonly message?: FrameRelayMessage;
  readonly error?: string;
}

/**
 * Safely parses a message event data into a typed message structure
 * @param messageEvent - The MessageEvent containing the data to parse
 * @returns Parsed message result with success/error information
 */
export function parseIncomingMessage(messageEvent: MessageEvent): MessageParseResult {
  try {
    if (!messageEvent?.data || typeof messageEvent.data !== "string") {
      return {
        success: false,
        error: "Invalid message event data format",
      };
    }

    const parsedMessage = JSON.parse(messageEvent.data) as FrameRelayMessage;

    if (!isValidMessageStructure(parsedMessage)) {
      return {
        success: false,
        error: "Message does not conform to expected structure",
      };
    }

    return {
      success: true,
      message: parsedMessage,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown parsing error",
    };
  }
}

/**
 * Validates that a parsed object conforms to the FrameRelayMessage interface
 */
function isValidMessageStructure(obj: unknown): obj is FrameRelayMessage {
  if (!obj || typeof obj !== "object") return false;

  const message = obj as Record<string, unknown>;

  // Type field is required
  if (!message.type || typeof message.type !== "string") return false;

  // Optional fields should have correct types if present
  if (message.id !== undefined && typeof message.id !== "string") return false;
  if (message.method !== undefined && typeof message.method !== "string") return false;
  if (message.text !== undefined && typeof message.text !== "string") return false;

  return true;
}

/**
 * Validates if a URL origin is trusted for communication
 * Supports exact matches and wildcard subdomain patterns
 * @param originUrl - The URL object to validate
 * @returns true if the origin is trusted, false otherwise
 */
export function validateTrustedOrigin(originUrl: URL, trustedOrigins: readonly string[]): boolean {
  return trustedOrigins.some((pattern) => isHostMatchingPattern(pattern, originUrl.host));
}

/**
 * Checks if a host matches a given pattern (supports wildcards)
 * @param pattern - The pattern to match against (e.g., "*.example.com" or "localhost:3000")
 * @param hostname - The hostname to test
 * @returns true if the host matches the pattern
 */
function isHostMatchingPattern(pattern: string, hostname: string): boolean {
  // Handle wildcard patterns (e.g., "*.example.com")
  if (pattern.startsWith("*.")) {
    const domainSuffix = pattern.substring(1); // Remove the '*'
    return (
      hostname.endsWith(domainSuffix) &&
      hostname !== domainSuffix && // Prevent exact match of suffix
      hostname.split(".").length === domainSuffix.split(".").length
    );
  }

  // Exact hostname match
  return pattern === hostname;
}

/**
 * Safely accesses the window object with SSR protection
 * @returns The global window object
 * @throws Error if window is not available (SSR environment)
 */
export function getSecureWindowReference(): Window {
  if (typeof window === "undefined") {
    throw new Error("Window object is not available in server-side rendering environment");
  }
  return window;
}

/**
 * Attempts to determine the origin of the parent window
 * Falls back to wildcard if origin cannot be determined
 * @returns The parent origin URL or "*" as fallback
 */
export function extractParentOrigin(): string {
  try {
    const referrerUrl = document.referrer;
    if (!referrerUrl) {
      console.warn("No referrer URL found, using wildcard origin");
      return "*";
    }

    const parsedUrl = new URL(referrerUrl);
    return parsedUrl.origin;
  } catch (error) {
    console.warn("Failed to parse referrer URL:", error);
    return "*";
  }
}
