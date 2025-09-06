import { defineComponent, Testing } from '../index.js';

describe('Delegated event bindings are idempotent across re-renders', () => {
  let host;
  beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); });
  afterEach(() => { if (host && host.parentNode) host.parentNode.removeChild(host); });

  it('click handler fires once after many re-renders', async () => {
    const Comp = defineComponent(({ html, on, useState }) => {
      const [n, setN] = useState(0);
      on('click', '#btn', () => setN(v => v + 1));
      const render = () => html`<div><button id="btn">Click</button><span id="val">${n}</span></div>`;
      return { render };
    });

    const { container, instance } = Testing.mount(Comp);

    // Force multiple re-renders
    for (let i = 0; i < 10; i++) {
      instance.setState({ _t: i });
    }

    // Click once
    const btn = container.querySelector('#btn');
    Testing.fire(btn, 'click');

    // Wait for update
    await Testing.waitFor(() => container.querySelector('#val')?.textContent === '1');

    // Ensure it's exactly one
    const val = container.querySelector('#val')?.textContent;
    expect(val).toBe('1');
  });
});
