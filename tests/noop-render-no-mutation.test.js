import { Component, Testing } from '../index.js';

class StaticComp extends Component {
  constructor() { super(null, { n: 0 }); }
  template() { return '<div id="root"><span>static</span></div>'; }
}

describe('No-op render causes zero DOM mutations', () => {
  let host;
  beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); });
  afterEach(() => { if (host && host.parentNode) host.parentNode.removeChild(host); });

  it('second render with identical HTML produces no mutations', async () => {
    const c = new StaticComp();
    c.mount(host);
    const target = host;

    const records = [];
    const mo = new MutationObserver((muts) => { records.push(...muts); });
    mo.observe(target, { childList: true, subtree: true, characterData: true, attributes: true });

    // Force a second render with identical output
    c.render();

    // Flush microtasks
    await Promise.resolve();

    mo.disconnect();
    // Expect zero mutations during the second render
    expect(records.length).toBe(0);
  });
});
