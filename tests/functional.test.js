import { defineComponent } from '../index.js';

describe('Functional Components (defineComponent)', () => {
  let host;

  beforeEach(() => {
    host = document.createElement('div');
    host.id = 'host-fc';
    document.body.appendChild(host);
  });

  afterEach(() => {
    if (host && host.parentNode) host.parentNode.removeChild(host);
  });

  it('renders and updates state with useState + delegated event', async () => {
    const Counter = defineComponent(({ useState, html, on }) => {
      const [n, setN] = useState(0);
      on('click', '#inc', () => setN((v) => v + 1));
      const render = () => html`<button id="inc">+1</button><span data-testid="n">${n}</span>`;
      return { render };
    });

    const c = new Counter();
    c.mount(host);

    // Initial
    await Promise.resolve();
    const span = host.querySelector('[data-testid="n"]');
    expect(span).toBeTruthy();
    expect(span.textContent).toBe('0');

    // Click
    const btn = host.querySelector('#inc');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(host.querySelector('[data-testid="n"]').textContent).toBe('1');
  });

  it('runs useEffect after mount and cleans up on unmount', async () => {
    const flags = { mounted: false, cleaned: false };

    const Eff = defineComponent(({ useEffect, html }) => {
      useEffect(() => {
        flags.mounted = true;
        return () => { flags.cleaned = true; };
      }, []);
      const render = () => html`<div data-testid="ok">OK</div>`;
      return { render };
    });

    const e = new Eff();
    e.mount(host);
    await Promise.resolve();
    await Promise.resolve();
    expect(flags.mounted).toBe(true);

    e.unmount();
    expect(flags.cleaned).toBe(true);
  });
});
