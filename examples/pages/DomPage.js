import { defineComponent, createElement } from '../../index.js';

// DOM Demo Page (functional)
export const DomPage = defineComponent(({ html, on, find }) => {
  on('click', '#addItem', () => {
    const list = find('#dom-list');
    if (!list) return;
    const idx = list.children.length + 1;
    const item = createElement('li', { className: 'row', dataset: { idx } },
      createElement('span', { style: { flex: 1 } }, `Item #${idx}`),
      createElement('button', { className: 'btn', onClick: () => alert(`Clicked ${idx}`) }, 'Click'));
    list.appendChild(item);
  });

  on('click', '#clearItems', () => {
    const list = find('#dom-list');
    if (list) list.innerHTML = '';
  });

  const render = () => html`
      <div>
        <h2>DOM Utilities</h2>
        <div class="row" style="margin-bottom:.5rem;">
          <button id="addItem" class="btn">Add Item</button>
          <button id="clearItems" class="btn" style="background:#6c757d;">Clear</button>
        </div>
        <ul id="dom-list" class="list"></ul>
        <p class="muted">Built with createElement(), event handlers, and dataset/style/class usage. Try the buttons.</p>
      </div>
    `;

  return { render };
});
