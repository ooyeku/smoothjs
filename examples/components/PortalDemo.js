import { defineComponent } from '../../index.js';

const PortalDemo = defineComponent(({ useState, html, portal, on }) => {
  const [show, setShow] = useState(true);
  const [count, setCount] = useState(0);

  on('click', '#toggle', () => setShow(v => !v));
  on('click', '#increment', () => setCount(v => v + 1));

  const portalMarker = show
    ? portal('#portal-target', () => html`
        <div data-key="portal" style="position:fixed; right: 1rem; bottom: 1rem; background: var(--card); color: inherit; border: 1px solid var(--border); border-radius: 8px; padding: .75rem 1rem; box-shadow: 0 6px 12px rgba(0,0,0,.15);">
          <div style="font-weight:600; margin-bottom:.25rem;">Portal Box</div>
          <div style="font-size:.9rem;">Count: ${count}</div>
        </div>
      `)
    : '';

  const render = () => html`
    <div style="display: grid; gap: .5rem;">
      <div class="muted" style="font-size:.9rem;">This component renders a floating box into #portal-target using portals.</div>
      <div class="row">
        <button id="toggle" class="btn" type="button">${show ? 'Hide' : 'Show'} Portal</button>
        <button id="increment" class="btn" type="button">Increment</button>
      </div>
      ${portalMarker}
    </div>
  `;

  return { render };
});

export { PortalDemo };
