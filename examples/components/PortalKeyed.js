import { defineComponent } from '../../index.js';
export const PortalKeyed = defineComponent(({ html, portal, useState, on }) => {
  const [open, setOpen] = useState(false);
  on('click', '#toggle', () => setOpen(v => !v));
  const render = () => html`
    <button id="toggle">${open ? 'Close' : 'Open'} toast</button>
    ${open ? portal('#toast-root', `<div data-key="toast">Toast</div>`, 'toast') : ''}
  `;
  return { render };
});
