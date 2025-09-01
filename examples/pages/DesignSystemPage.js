import { defineComponent, Velvet } from '../../index.js';

export const DesignSystemPage = defineComponent(({ html, on, useState, useEffect, find }) => {
  const { VelvetUI } = Velvet;
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  let btn1 = null, btn2 = null, btn3 = null, input = null, tabs = null, modal = null;

  on('click', '#open-modal', () => setModalOpen(true));

  const onMount = () => {
    // Buttons
    const b1Host = find('#btn1');
    const b2Host = find('#btn2');
    const b3Host = find('#btn3');
    btn1 = new VelvetUI.Button(null, {}, { variant: 'primary', children: 'Primary', onClick: () => console.log('Primary clicked') });
    btn2 = new VelvetUI.Button(null, {}, { variant: 'secondary', children: 'Secondary' });
    btn3 = new VelvetUI.Button(null, {}, { variant: 'ghost', children: 'Ghost' });
    if (b1Host) btn1.mount(b1Host);
    if (b2Host) btn2.mount(b2Host);
    if (b3Host) btn3.mount(b3Host);

    // Input
    const inputHost = find('#input1');
    input = new VelvetUI.Input(null, {}, {
      placeholder: 'Type to update state...',
      value: inputValue,
      onInput: (e) => setInputValue(e.target.value)
    });
    if (inputHost) input.mount(inputHost);

    // Tabs
    const tabsHost = find('#tabs');
    tabs = new VelvetUI.Tabs(null, {}, {
      tabs: [
        { id: 't1', label: 'One', content: '<p>Tab one content</p>' },
        { id: 't2', label: 'Two', content: '<p>Second tab content</p>' },
        { id: 't3', label: 'Three', content: '<p>Third tab content</p>' }
      ],
      onChange: (i) => console.log('Tab changed to', i)
    });
    if (tabsHost) tabs.mount(tabsHost);

    // Modal
    const modalHost = find('#modal');
    modal = new VelvetUI.Modal(null, {}, {
      open: modalOpen,
      title: 'Design System Modal',
      onClose: () => setModalOpen(false)
    });
    if (modalHost) modal.mount(modalHost);
  };

  const onUnmount = () => {
    [btn1, btn2, btn3, input, tabs, modal].forEach((c, i) => { try { c && c.unmount(); } catch {} });
    btn1 = btn2 = btn3 = input = tabs = modal = null;
  };

  // Sync external components with state when values change
  useEffect(() => { if (modal) modal.setProps({ open: modalOpen }); }, [modalOpen]);
  useEffect(() => { if (input) input.setProps({ value: inputValue }); }, [inputValue]);

  const render = () => html`
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
          <div class="muted" style="margin-top:.5rem;">Value: ${inputValue}</div>
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

  return { render, onMount, onUnmount };
});
