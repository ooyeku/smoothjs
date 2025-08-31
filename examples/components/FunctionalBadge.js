import { defineComponent } from '../../index.js';

// A tiny functional badge rendered in the portal target so it appears on all pages
const FunctionalBadge = defineComponent(({ useState, html, on }) => {
  const [visible, setVisible] = useState(true);
  on('click', '[data-id="close-fb"]', () => setVisible(false));

  const render = () => html`
    ${visible ? `
      <div data-key="functional-badge" style="position: fixed; right: 1rem; bottom: 1rem; z-index: 50;">
        <div style="background: var(--card); color: inherit; border: 1px solid var(--border); border-radius: 9999px; padding: .35rem .6rem; box-shadow: 0 6px 12px rgba(0,0,0,.15); display:flex; align-items:center; gap:.4rem;">
          <span style="display:inline-block; width:.5rem; height:.5rem; background:#22c55e; border-radius:9999px;"></span>
          <span style="font-size:.8rem;">Functional UI</span>
          <button data-id="close-fb" type="button" aria-label="Hide badge" style="background:transparent; border:0; color:inherit; cursor:pointer; font-size:.9rem;">×</button>
        </div>
      </div>
    ` : ''}
  `;

  return { render };
});

export { FunctionalBadge };
