import { defineComponent } from '../../index.js';

export const KeyedList = defineComponent(({ html, on, useState }) => {
  const [items, setItems] = useState([{ id: 'a', t: 'A' }, { id: 'b', t: 'B' }, { id: 'c', t: 'C' }]);

  on('click', '#shuffle', () => setItems(i => [i[2], i[0], i[1]]));
  on('click', '#add', () => setItems(i => [...i, { id: String(Date.now()), t: 'New' }]));
  on('click', '#remove', () => setItems(i => i.slice(0, -1)));

  const render = () => html`
    <div>
      <div class="row">
        <button id="shuffle">Shuffle</button>
        <button id="add">Add</button>
        <button id="remove">Remove</button>
      </div>
      <ul>
        ${items.map(i => `<li data-key="${i.id}">${i.t}</li>`).join('')}
      </ul>
    </div>
  `;
  return { render };
});
