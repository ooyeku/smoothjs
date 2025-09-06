import { defineComponent, http } from '../../index.js';

export const HttpErrorDemo = defineComponent(({ html, on, useState }) => {
  const [err, setErr] = useState(null);
  on('click', '#load', async () => {
    try {
      await http.get('/missing-endpoint');
    } catch (e) {
      setErr(e);
    }
  });
  const render = () => html`
    <div>
      <button id="load">Load</button>
      ${err ? `<pre>Error ${err.status} ${err.statusText}\nURL: ${err.url}\nBody: ${err.body}</pre>` : ''}
    </div>
  `;
  return { render };
});
