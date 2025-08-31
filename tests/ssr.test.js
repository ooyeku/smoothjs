import { describe, it, expect } from 'vitest';
import { SSR } from '../src/ssr/index.js';
import { SmoothComponent } from '../src/component/SmoothComponent.js';

class TestCounter extends SmoothComponent {
  constructor() { super(null, { count: 0 }); }
  onCreate() { this.on('click', '#inc', () => this.setState(prev => ({ count: prev.count + 1 }))); }
  template() { return this.html`<div><span id="value">${this.state.count}</span><button id="inc">+1</button></div>`; }
}

describe('SSR + Hydration', () => {
  it('hydrates server-rendered markup and preserves interactivity', async () => {
    const html = SSR.renderToString(TestCounter, { state: { count: 2 }, containerId: 'root' });
    document.body.innerHTML = html;

    const instance = new TestCounter();
    instance.hydrate('#root', { state: { count: 2 } });

    const value = document.querySelector('#value');
    const btn = document.querySelector('#inc');
    expect(value.textContent).toBe('2'); // server markup present

    // Click to trigger state change and a re-render
    btn.click();
    await Promise.resolve();

    expect(document.querySelector('#value').textContent).toBe('3');
  });
});
