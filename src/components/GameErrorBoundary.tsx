import React, { useState, useEffect } from "react";
import { GameService } from "../lib";

interface GameErrorBoundaryProps {
  gs: GameService;
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; resetGame: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface GameErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  gameState: string;
}

/**
 * Enhanced error boundary specifically designed for game components
 * Provides game-specific error recovery and debugging information
 */
export class GameErrorBoundary extends React.Component<GameErrorBoundaryProps, GameErrorBoundaryState> {
  constructor(props: GameErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      gameState: props.gs.getSession(),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GameErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo,
      gameState: this.props.gs.getSession(),
    });

    // Track error in game service
    this.props.gs.track("Component Error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      gameState: this.props.gs.getSession(),
      gameLevel: this.props.gs.getCurrLevel(),
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("🎮 Game Error Boundary");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.log("Game State:", {
        session: this.props.gs.getSession(),
        level: this.props.gs.getCurrLevel(),
        state: this.props.gs.getState(),
      });
      console.groupEnd();
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  resetGame = () => {
    try {
      this.props.gs.resetSession();
      this.retry();
    } catch (error) {
      console.error("Failed to reset game:", error);
      // Force page reload as last resort
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, gameState } = this.state;
      const { fallback: Fallback } = this.props;

      if (Fallback) {
        return <Fallback error={error!} retry={this.retry} resetGame={this.resetGame} />;
      }

      return (
        <div className="flex items-center justify-center w-full h-full p-4 bg-red-50">
          <div className="w-full max-w-2xl p-6 bg-white border border-red-200 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full">
                <span className="font-bold text-white">!</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-700">Game Error</h1>
                <p className="text-red-600">Something went wrong during gameplay</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-red-100 border border-red-200 rounded">
                <h3 className="mb-1 font-semibold text-red-800">Error Details</h3>
                <p className="font-mono text-sm text-red-700">{error?.message || "Unknown error"}</p>
              </div>

              <div className="p-3 bg-gray-100 border rounded">
                <h3 className="mb-1 font-semibold text-gray-800">Game State</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Session:</span> {gameState}
                  </p>
                  <p>
                    <span className="font-medium">Level:</span> {this.props.gs.getCurrLevel() + 1}
                  </p>
                  <p>
                    <span className="font-medium">Assets:</span> {Object.keys(this.props.gs.assets).length} loaded
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV === "development" && (
                <details className="p-3 border border-yellow-200 rounded bg-yellow-50">
                  <summary className="font-semibold text-yellow-800 cursor-pointer">Development Details</summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <h4 className="font-medium text-yellow-800">Stack Trace:</h4>
                      <pre className="p-2 overflow-auto text-xs text-yellow-700 bg-yellow-100 rounded max-h-32">
                        {error?.stack}
                      </pre>
                    </div>
                    {errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium text-yellow-800">Component Stack:</h4>
                        <pre className="p-2 overflow-auto text-xs text-yellow-700 bg-yellow-100 rounded max-h-32">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={this.retry} className="flex-1 px-4 py-2 rounded-md">
                  Try Again
                </button>
                <button onClick={this.resetGame} className="flex-1 px-4 py-2 bg-red-500 rounded-md">
                  Reset Game
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for handling async errors in game components
 */
export function useGameErrorHandler(gs: GameService) {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error, context?: string) => {
    setError(error);
    gs.track("Async Error", {
      error: error.message,
      stack: error.stack,
      context,
      gameState: gs.getSession(),
    });

    console.error("Game Error:", error, { context });
  };

  const clearError = () => setError(null);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error,
  };
}
