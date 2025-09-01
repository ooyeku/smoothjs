import { defineComponent, version, utils } from '../../index.js';

// About Page (functional)
export const AboutPage = defineComponent(({ html }) => {
  const render = () => {
    const now = new Date();
    return html`
      <div>
        <h2>About</h2>
        <p>Running SmoothJS v${version}</p>
        <p class="muted">Formatted date: ${utils.formatters.date(now)}</p>
        <p class="muted">Formatted number: ${utils.formatters.number(1234567.89)}</p>
      </div>
    `;
  };
  return { render };
});
