import React from "react";

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<any, IErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true, error, info });
  }

  reload() {
    location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full p-2 bg-zinc-100">
          <div className="w-full p-4 mx-auto my-auto space-y-4 text-black bg-white border shadow-xl lg:w-4/5 rounded-2xl">
            <div>
              <h1 className="text-3xl font-bold text-red-500">Error</h1>
              <h2>Oops, something went wrong!</h2>
            </div>
            <pre className="p-2 overflow-x-auto text-sm rounded bg-zinc-100">
              <code>{this.state.error?.toString()}</code>
              <code>{this.state.info?.componentStack}</code>
            </pre>

            <div className="flex justify-between">
              <button
                className="px-3 py-2 text-sm text-white rounded-md shadow bg-zinc-900"
                onClick={() => this.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }
    // if no error occurred, render children
    return this.props.children;
  }
}
