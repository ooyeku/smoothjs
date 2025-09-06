import { defineComponent } from '../../index.js';

export const EffectCleanup = defineComponent(({ html, on, useState, useEffect }) => {
  const [n, setN] = useState(0);
  on('click', '#inc', () => setN(v => v + 1));
  useEffect(() => {
    const id = setInterval(() => console.log('tick', n), 500);
    return () => clearInterval(id);
  }, [n]);
  const render = () => html`<button id="inc">n=${n} (tick)</button>`;
  return { render };
});
