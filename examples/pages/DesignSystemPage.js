import { Component, Velvet } from '../../index.js';

export class DesignSystemPage extends Component {
  constructor() {
    super(null, { modalOpen: false, inputValue: '' });
  }

  onCreate() {
    this.on('click', '#open-modal', () => this.setState({ modalOpen: true }));
  }

  onMount() {
    const { VelvetUI } = Velvet;
    // Buttons
    const b1Host = this.find('#btn1');
    const b2Host = this.find('#btn2');
    const b3Host = this.find('#btn3');
    this._btn1 = new VelvetUI.Button(null, {}, { variant: 'primary', children: 'Primary', onClick: () => console.log('Primary clicked') });
    this._btn2 = new VelvetUI.Button(null, {}, { variant: 'secondary', children: 'Secondary' });
    this._btn3 = new VelvetUI.Button(null, {}, { variant: 'ghost', children: 'Ghost' });
    if (b1Host) this._btn1.mount(b1Host);
    if (b2Host) this._btn2.mount(b2Host);
    if (b3Host) this._btn3.mount(b3Host);

    // Input
    const inputHost = this.find('#input1');
    this._input = new VelvetUI.Input(null, {}, {
      placeholder: 'Type to update state...',
      value: this.state.inputValue,
      onInput: (e) => this.setState({ inputValue: e.target.value })
    });
    if (inputHost) this._input.mount(inputHost);

    // Tabs
    const tabsHost = this.find('#tabs');
    this._tabs = new VelvetUI.Tabs(null, {}, {
      tabs: [
        { id: 't1', label: 'One', content: '<p>Tab one content</p>' },
        { id: 't2', label: 'Two', content: '<p>Second tab content</p>' },
        { id: 't3', label: 'Three', content: '<p>Third tab content</p>' }
      ],
      onChange: (i) => console.log('Tab changed to', i)
    });
    if (tabsHost) this._tabs.mount(tabsHost);

    // Modal
    const modalHost = this.find('#modal');
    this._modal = new VelvetUI.Modal(null, {}, {
      open: this.state.modalOpen,
      title: 'Design System Modal',
      onClose: () => this.setState({ modalOpen: false })
    });
    if (modalHost) this._modal.mount(modalHost);
  }

  onStateChange(prev, next) {
    if (this._modal) this._modal.setProps({ open: next.modalOpen });
    if (this._input) this._input.setProps({ value: next.inputValue });
  }

  onUnmount() {
    const comps = ['_btn1','_btn2','_btn3','_input','_tabs','_modal'];
    comps.forEach(k => { try { this[k] && this[k].unmount(); } catch {} this[k] = null; });
  }

  template() {
    return this.html`
      <div style="display:grid; gap: 1rem;">
        <div class="card" style="background: var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem;">
          <h2 style="margin:0 0 .5rem 0;">Buttons</h2>
          <div class="row" style="display:flex; gap:.5rem; align-items:center;">
            <span id="btn1"></span>
            <span id="btn2"></span>
            <span id="btn3"></span>
          </div>
        </div>

        <div class="card" style="background: var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem;">
          <h2 style="margin:0 0 .5rem 0;">Input</h2>
          <div id="input1"></div>
          <div class="muted" style="margin-top:.5rem;">Value: ${this.state.inputValue}</div>
        </div>

        <div class="card" style="background: var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem;">
          <h2 style="margin:0 0 .5rem 0;">Tabs</h2>
          <div id="tabs"></div>
        </div>

        <div class="card" style="background: var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem;">
          <h2 style="margin:0 0 .5rem 0;">Modal</h2>
          <button id="open-modal" class="btn" type="button">Open Modal</button>
          <div id="modal"></div>
        </div>
      </div>
    `;
  }
}
