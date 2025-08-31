import { Component } from '../../index.js';

export class ChildrenDemo extends Component {
  constructor() {
    super(null, { count: 0 });
  }

  onCreate() {
    this.on('click', '#add', () => {
      const n = this.state.count + 1;
      this.setState({ count: n });
      // append a child snippet demonstrating dynamic children
      const newChild = `<li data-key="c${n}">Child ${n}</li>`;
      this.setChildren([ ...(this.children || []), newChild ]);
    });
    this.on('click', '#clear', () => {
      this.setChildren([]);
      this.setState({ count: 0 });
    });
  }

  template() {
    return this.html`
      <div>
        <div class="row">
          <button id="add" class="btn" type="button">Add Child</button>
          <button id="clear" class="btn" type="button">Clear</button>
        </div>
        <ul class="list">${this.renderChildren()}</ul>
      </div>
    `;
  }
}
