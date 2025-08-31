import { Component, createElement } from '../../index.js';

// DOM Demo Page
export class DomPage extends Component {
  onCreate() {
    this.on('click', '#addItem', this.addItem)
        .on('click', '#clearItems', this.clearItems);
  }

  addItem() {
    const list = this.find('#dom-list');
    if (!list) return;
    const idx = list.children.length + 1;
    const item = createElement('li', { className: 'row', dataset: { idx } },
      createElement('span', { style: { flex: 1 } }, `Item #${idx}`),
      createElement('button', { className: 'btn', onClick: () => alert(`Clicked ${idx}`) }, 'Click'));
    list.appendChild(item);
  }

  clearItems() { 
    const list = this.find('#dom-list'); 
    if (list) list.innerHTML = ''; 
  }

  template() {
    return this.html`
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
  }
}
