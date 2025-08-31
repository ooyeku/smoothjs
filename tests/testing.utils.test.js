import { describe, it, expect } from 'vitest';
import Testing from '../src/testing/index.js';

class FakeComp {
  constructor() { this.calls = 0; this.element = null; this.events = new Map(); }
  on() { return this; }
  mount(root) { this.element = root || document.createElement('div'); this.render(); return this; }
  setState() { this.calls++; this.render(); }
  render() {
    if (!this.element) return;
    this.element.innerHTML = `<div data-testid="val">${this.calls}</div>`;
  }
}

describe('Testing utilities', () => {
  it('waitFor resolves after predicate becomes true', async () => {
    const { container } = Testing.render('<div id="root"></div>');
    const comp = new FakeComp();
    comp.mount(container.querySelector('#root'));
    // Initially 0
    expect(Testing.getByTestId(container, 'val').textContent).toBe('0');
    setTimeout(() => comp.setState({}), 20);
    await Testing.waitFor(() => Testing.getByTestId(container, 'val').textContent === '1', { timeout: 500, interval: 5 });
    expect(Testing.getByTestId(container, 'val').textContent).toBe('1');
  });

  it('act waits for micro/macro tasks to flush', async () => {
    const { container } = Testing.render('<div id="root2"></div>');
    const comp = new FakeComp();
    comp.mount(container.querySelector('#root2'));
    await Testing.act(async () => {
      comp.setState({});
      await Promise.resolve();
    });
    expect(Testing.getByTestId(container, 'val').textContent).toBe('1');
  });
});
