import { defineComponent } from '../../index.js';

export const ChildrenDemo = defineComponent(({ useState, html, on }) => {
  const [count, setCount] = useState(0);
  const [children, setChildren] = useState([]);

  on('click', '#add', () => {
    const n = Number(count) + 1;
    setCount(n);
    setChildren((prev) => [...(prev || []), `<li data-key="c${n}">Child ${n}</li>`]);
  });

  on('click', '#clear', () => {
    setChildren([]);
    setCount(0);
  });

  const render = () => html`
      <div>
        <div class="row">
          <button id="add" class="btn" type="button">Add Child</button>
          <button id="clear" class="btn" type="button">Clear</button>
        </div>
        <ul class="list">${(children || []).join('')}</ul>
      </div>
    `;

  return { render };
});
