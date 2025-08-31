import { defineComponent, createContext } from '../../index.js';

// Context demo: Provider passes a name; Consumer reads it via useContext
const NameContext = createContext('Guest');

const ContextDemo = defineComponent(({ useState, useContext, provideContext, html, on }) => {
  const [name, setName] = useState('Alice');

  on('input', '#name', (e) => {
    setName(e.target.value);
  });

  const render = () => {
    // Provide context on the current element so children (and this component) can read it
    provideContext(NameContext, name);
    const consumed = useContext(NameContext);
    return html`
      <div style="display: grid; gap: 0.75rem;">
        <div>
          <label for="name" style="display:block; font-size:0.875rem; color:#374151; margin-bottom:0.25rem;">Provide name</label>
          <input id="name" class="input" type="text" value="${name}" placeholder="Type a name...">
        </div>
        <div style="padding: 0.75rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="font-size: 0.875rem; color: #374151;">Hello, <strong>${consumed}</strong>!</div>
          <div style="font-size: 0.75rem; color: #6b7280;">This block reads from context.</div>
        </div>
      </div>
    `;
  };

  return { render };
});

export { ContextDemo };
