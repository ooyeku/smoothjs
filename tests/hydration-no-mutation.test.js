import { defineComponent, Testing } from '../index.js';

describe('Hydration performs zero DOM mutations with identical HTML', () => {
  let host;
  beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); });
  afterEach(() => { if (host && host.parentNode) host.parentNode.removeChild(host); });

  it('hydrate() binds events without mutating DOM', async () => {
    const Comp = defineComponent(({ html, on, useState }) => {
      const [n, setN] = useState(0);
      on('click', '#btn', () => setN(v => v + 1));
      const render = () => html`<div id="root"><button id="btn">Click</button><span id="val">${n}</span></div>`;
      return { render };
    });

    // Simulate server HTML
    const serverHTML = '<div id="root"><button id="btn">Click</button><span id="val">0</span></div>';
    host.innerHTML = serverHTML;

    const c = new Comp();

    const records = [];
    const mo = new MutationObserver((muts) => { records.push(...muts); });
    mo.observe(host, { childList: true, subtree: true, characterData: true, attributes: true });

    // Hydrate should not mutate identical DOM
    c.hydrate(host);

    // Allow any microtasks to run
    await Promise.resolve();
    mo.disconnect();

    expect(records.length).toBe(0);

    // Ensure events work post-hydrate
    const btn = host.querySelector('#btn');
    Testing.fire(btn, 'click');
    await Testing.waitFor(() => host.querySelector('#val')?.textContent === '1');
    expect(host.querySelector('#val')?.textContent).toBe('1');
  });
});
