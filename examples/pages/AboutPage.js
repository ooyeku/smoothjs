import { Component, version, utils } from '../../index.js';

// About Page
export class AboutPage extends Component {
  template() {
    const now = new Date();
    return this.html`
      <div>
        <h2>About</h2>
        <p>Running SmoothJS v${version}</p>
        <p class="muted">Formatted date: ${utils.formatters.date(now)}</p>
        <p class="muted">Formatted number: ${utils.formatters.number(1234567.89)}</p>
      </div>
    `;
  }
}
