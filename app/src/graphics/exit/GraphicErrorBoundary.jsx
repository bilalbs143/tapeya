import { Component } from 'react';

import { graphicDebugLog } from '../entry/debugLog';
import { pushOverlayError, pushOverlayLog } from '../entry/overlayDiagnostics';

/**
 * Catches render errors in theme components so the OBS source stays transparent.
 */
export class GraphicErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    graphicDebugLog('renderer:error', {
      commandKey: this.props.commandKey,
      error: error?.message ?? String(error),
      info,
    });
    pushOverlayError('GraphicErrorBoundary', error);
    pushOverlayLog('renderer:error', {
      commandKey: this.props.commandKey,
      message: error?.message ?? String(error),
    });
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.contextHash !== this.props.contextHash) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
