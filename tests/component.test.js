import { describe, it, expect } from 'vitest';
import { SmoothComponent } from '../src/component/SmoothComponent.js';
import { utils } from '../src/utils/index.js';

class SimpleComp extends SmoothComponent {
  constructor() { super(null, { n: 0, crash: false, text: '' }); }
  renderError(err) { return this.html`<div data-testid="err">${utils.escapeHtml(err.message)}</div>`; }
  template() {
    if (this.state.crash) throw new Error('boom');
    return this.html`<div><span id="val">${this.state.n}</span><input id="inp" value="${utils.escapeHtml(this.state.text)}"></div>`;
  }
}

describe('SmoothComponent', () => {
  it('renders and batches setState via utils.batch', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const c = new SimpleComp();
    c.mount(host);
    utils.batch(() => {
      c.setState({ n: 1 });
      c.setState({ n: 2 });
    });
    await Promise.resolve();
    expect(host.querySelector('#val').textContent).toBe('2');
  });

  it('shows renderError fallback on error', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const c = new SimpleComp();
    c.mount(host);
    c.setState({ crash: true });
    await Promise.resolve();
    const err = host.querySelector('[data-testid="err"]');
    expect(err).toBeTruthy();
    expect(err.textContent).toContain('boom');
  });

  it('preserves focus and input value across re-render', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const c = new SimpleComp();
    c.mount(host);
    c.setState({ text: 'hello' });
    await Promise.resolve();
    const inp = host.querySelector('#inp');
    inp.focus();
    inp.setSelectionRange(1, 3);
    c.setState({ n: 42 });
    await Promise.resolve();
    expect(document.activeElement).toBe(inp);
    expect(inp.value).toBe('hello');
  });
});
