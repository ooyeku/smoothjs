import { defineComponent, Testing } from '../index.js';

// This test reproduces the Todo scenario: an unkeyed placeholder mixed with keyed <li> items.
describe('Mixed keyed/unkeyed list (placeholder + keyed items)', () => {
  let host;
  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });
  afterEach(() => {
    if (host && host.parentNode) host.parentNode.removeChild(host);
  });

  it('removes placeholder and shows new keyed item after add', async () => {
    const Comp = defineComponent(({ html, on, useState }) => {
      const [items, setItems] = useState([]);
      on('click', '#add', () => setItems((list) => [...list, { id: 'x1', t: 'Hello' }]));
      const render = () => html`
        <div>
          <button id="add">Add</button>
          <ul id="list">
            ${items.length === 0 ? `<div class="empty">No items</div>` : ''}
            ${items.map(i => `<li data-key="${i.id}">${i.t}</li>`).join('')}
          </ul>
        </div>`;
      return { render };
    });

    const { container, unmount } = Testing.mount(Comp);

    // Initially shows placeholder
    const list = container.querySelector('#list');
    expect(list).toBeTruthy();
    expect(list.querySelector('.empty')?.textContent).toContain('No items');
    expect(list.querySelectorAll('li').length).toBe(0);

    // Click add
    const addBtn = container.querySelector('#add');
    Testing.fire(addBtn, 'click');

    // Wait for DOM to reflect new item
    await Testing.waitFor(() => list.querySelectorAll('li').length === 1);

    // Placeholder should be gone, <li> present
    expect(list.querySelector('.empty')).toBeFalsy();
    const li = list.querySelector('li');
    expect(li).toBeTruthy();
    expect(li?.getAttribute('data-key')).toBe('x1');
    expect(li?.textContent).toBe('Hello');

    unmount();
  });
});
