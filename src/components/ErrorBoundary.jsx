import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-bg p-6 text-center">
          <div className="max-w-md">
            <p className="eyebrow mb-4">A wilted leaf</p>
            <h1 className="font-display text-4xl">Something went wrong</h1>
            <p className="mt-3 text-muted">{this.state.error?.message || "An unexpected error occurred."}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 rounded-full bg-forest px-6 py-3 font-semibold text-on-forest"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
