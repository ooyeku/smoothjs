import { Component, utils } from '../../index.js';

// Global Error Boundary Component
export class GlobalErrorBoundary extends Component {
  constructor() {
    super(null, {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  }

  onError(error, errorInfo) {
    console.error('Global Error Boundary caught:', error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });
  }

  renderError(error) {
    return this.html`
      <div style="max-width: 768px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: white; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">!</div>
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600; color: #dc2626;">Application Error</h2>
            <p style="margin: 0; color: #6b7280;">Something went wrong in the application</p>
          </div>

          <div style="padding: 1.5rem; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
              <span style="font-weight: 500;">Error Count:</span>
              <span style="padding: 0.25rem 0.5rem; background: #fecaca; color: #991b1b; border-radius: 4px; font-size: 0.875rem; font-weight: 500;">
                ${this.state.errorCount}
              </span>
            </div>
            <div style="font-size: 0.875rem; color: #991b1b;">
              <strong>${utils.escapeHtml(error.message || 'Unknown Error')}</strong>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <button
              style="background: #0ea5e9; color: white; border: 1px solid #0ea5e9; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;"
              onclick="window.location.reload()"
            >
              Reload App
            </button>
            <button
              style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;"
              onclick="this.setState({ hasError: false, error: null, errorInfo: null })"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    `;
  }

  template() {
    // If there's an error, render the error UI
    if (this.state.hasError) {
      return this.renderError(this.state.error);
    }

    // Otherwise, render the children (this would be the main app content)
    return this.html`
      <div id="app-content">
        <!-- App content will be mounted here -->
      </div>
    `;
  }
}
