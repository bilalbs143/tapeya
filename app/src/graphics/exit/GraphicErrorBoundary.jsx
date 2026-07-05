import { Component } from 'react';

import { graphicDebugLog } from '../entry/debugLog';

/**
 * @typedef {Object} GraphicErrorBoundaryProps
 * @property {import('react').ReactNode} [children]
 * @property {string|null} [commandKey]
 * @property {string|null} [contextHash]
 */

/**
 * @typedef {Object} GraphicErrorBoundaryState
 * @property {boolean} hasError
 */

/**
 * Catches render errors in theme components so the OBS source stays transparent.
 * @extends {Component<GraphicErrorBoundaryProps, GraphicErrorBoundaryState>}
 */
export class GraphicErrorBoundary extends Component {
  /** @param {GraphicErrorBoundaryProps} props */
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  /**
   * @param {Error} error
   * @param {import('react').ErrorInfo} info
   */
  componentDidCatch(error, info) {
    graphicDebugLog('renderer:error', {
      commandKey: this.props.commandKey,
      error: error?.message ?? String(error),
      info,
    });
  }

  /** @param {GraphicErrorBoundaryProps} prevProps */
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
