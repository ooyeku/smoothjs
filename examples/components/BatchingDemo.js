import { Component } from '../../index.js';

export class BatchingDemo extends Component {
  constructor() { super(null, { a: 0, b: 0 }); }
  onCreate() {
    this.on('click', '#separate', () => {
      this.setState({ a: this.state.a + 1 });
      this.setState({ b: this.state.b + 1 });
    });
    this.on('click', '#batched', () => {
      Component.batch(() => {
        this.setState({ a: this.state.a + 1 });
        this.setState({ b: this.state.b + 1 });
      });
    });
  }
  template() {
    return this.html`
      <div>
        <button id="separate">2 updates</button>
        <button id="batched">2 updates (batched)</button>
        <div>a=${this.state.a} b=${this.state.b}</div>
      </div>
    `;
  }
}
