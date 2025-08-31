import { Component } from '../../index.js';

// Minimal SSR-friendly counter component
export class SsrCounter extends Component {
  constructor(element = null, initialState = { count: 0 }, props = {}) {
    super(element, initialState, props);
  }

  onCreate() {
    this.on('click', '#inc', () => this.setState(prev => ({ count: prev.count + 1 })));
  }

  template() {
    // Return a plain string so SSR.renderToString can safely serialize
    return this.html`
      <div data-testid="ssr-counter">
        <span id="value">${this.state.count}</span>
        <button id="inc" type="button">+1</button>
      </div>
    `;
  }
}
