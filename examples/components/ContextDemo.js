import { Component, createContext } from '../../index.js';

// Context demo: Provider passes a name; Consumer reads it via useContext
const NameContext = createContext('Guest');

class ContextConsumer extends Component {
  template() {
    const name = this.useContext(NameContext);
    return this.html`
      <div style="padding: 0.75rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="font-size: 0.875rem; color: #374151;">Hello, <strong>${name}</strong>!</div>
        <div style="font-size: 0.75rem; color: #6b7280;">This element reads from context.</div>
      </div>
    `;
  }
}

export class ContextDemo extends Component {
  constructor() {
    super(null, { name: 'Alice' });
  }

  onCreate() {
    // initial provide; pending context applied on first render
    this.provideContext(NameContext, this.state.name);
    this.on('input', '#name', (e) => {
      this.setState({ name: e.target.value });
    });
  }

  onMount() {
    // mount consumer inside our DOM so it can read the provided context
    const mountPoint = this.find('#consumer');
    if (mountPoint) {
      this._consumer = new ContextConsumer();
      this._consumer.mount(mountPoint);
    }
  }

  onStateChange(prev, next) {
    // update provided context for this element and ask consumer to re-render
    this.provideContext(NameContext, next.name);
    if (this._consumer && this._consumer.element) {
      try { this._consumer.render(); } catch {}
    }
  }

  onUnmount() {
    if (this._consumer) {
      try { this._consumer.unmount(); } catch {}
      this._consumer = null;
    }
  }

  template() {
    // ensure latest context before building children
    this.provideContext(NameContext, this.state.name);
    return this.html`
      <div style="display: grid; gap: 0.75rem;">
        <div>
          <label for="name" style="display:block; font-size:0.875rem; color:#374151; margin-bottom:0.25rem;">Provide name</label>
          <input id="name" class="input" type="text" value="${this.state.name}" placeholder="Type a name...">
        </div>
        <div id="consumer"></div>
      </div>
    `;
  }
}
