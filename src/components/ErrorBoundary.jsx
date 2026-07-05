import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="scene-error">
          <div className="scene-error__card">
            <div className="scene-error__kicker">the shed</div>
            <h2 className="scene-error__title">This corner won&apos;t load.</h2>
            <p className="scene-error__body">
              Something went wrong bringing the 3D scene to life — usually a
              model or graphics hiccup. A reload almost always fixes it.
            </p>
            <button className="scene-error__retry" onClick={this.handleRetry}>
              ↻ reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
