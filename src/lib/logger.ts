/**
 * Logger utility for consistent debug and warning messages across the game service
 */

export interface Logger {
  debug(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  info(...args: any[]): void;
}

export interface LoggerConfig {
  name: string;
  enableDebug?: boolean;
  enableWarn?: boolean;
  enableError?: boolean;
  enableInfo?: boolean;
  prefix?: string;
}

/**
 * Create a logger instance with consistent formatting
 */
export function createLogger(config: LoggerConfig): Logger {
  const { name, enableDebug = true, enableWarn = true, enableError = true, enableInfo = true, prefix = "" } = config;

  const logPrefix = prefix ? `[${prefix}][${name}]:` : `[${name}]:`;

  return {
    /**
     * Log debug information to console
     */
    debug(...args: any[]): void {
      if (enableDebug) {
        console.info(logPrefix, ...args);
      }
    },

    /**
     * Log warning information to console
     */
    warn(...args: any[]): void {
      if (enableWarn) {
        console.warn(logPrefix, ...args);
      }
    },

    /**
     * Log error information to console
     */
    error(...args: any[]): void {
      if (enableError) {
        console.error(logPrefix, ...args);
      }
    },

    /**
     * Log info information to console
     */
    info(...args: any[]): void {
      if (enableInfo) {
        console.info(logPrefix, ...args);
      }
    },
  };
}

/**
 * Logger configuration presets
 */
export const loggerPresets = {
  /**
   * Development preset - all logging enabled
   */
  development: {
    enableDebug: true,
    enableWarn: true,
    enableError: true,
    enableInfo: true,
  },

  /**
   * Production preset - only warnings and errors
   */
  production: {
    enableDebug: false,
    enableWarn: true,
    enableError: true,
    enableInfo: false,
  },

  /**
   * Silent preset - no logging
   */
  silent: {
    enableDebug: false,
    enableWarn: false,
    enableError: false,
    enableInfo: false,
  },

  /**
   * Error only preset - only errors
   */
  errorOnly: {
    enableDebug: false,
    enableWarn: false,
    enableError: true,
    enableInfo: false,
  },
};

export const dummyLogger: Logger = {
  debug: () => {},
  warn: () => {},
  error: () => {},
  info: () => {},
};
