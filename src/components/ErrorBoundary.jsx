import { Component } from "react";

// Catches render/lazy-load failures in a route so one broken chunk (common right
// after a deploy while a tab is still open) shows a recoverable message instead
// of blanking the whole app.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="error-boundary">
            <p className="error-boundary__title">Something came loose in the archive.</p>
            <p className="error-boundary__msg">
              This section would not load. A reload usually sets it right.
            </p>
            <button className="error-boundary__btn" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
