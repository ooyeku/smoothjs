import { Component, utils } from '../index.js';

export default class UserDetails extends Component {
  constructor() {
    super(null, { loading: true, user: null, error: null });
  }

  onCreate() {
    // Simulate async data load based on dynamic param id
    const id = this.props && this.props.params ? this.props.params.id : null;
    this._abort = false;
    // Fake async fetch
    setTimeout(() => {
      if (this._abort) return;
      if (!id) {
        this.setState({ loading: false, error: 'Missing user id' });
        return;
      }
      // Mocked details
      const profiles = {
        '1': { id: 1, name: 'Ada Lovelace', role: 'Mathematician', bio: 'Pioneer of computing and the first programmer.' },
        '2': { id: 2, name: 'Alan Turing', role: 'Computer Scientist', bio: 'Father of theoretical computer science and AI.' },
        '3': { id: 3, name: 'Grace Hopper', role: 'Rear Admiral / Computer Scientist', bio: 'Developed the first compiler and popularized COBOL.' }
      };
      const user = profiles[String(id)] || { id, name: `User #${id}`, role: 'Unknown', bio: 'Loaded lazily via router.' };
      this.setState({ loading: false, user });
    }, 500);
  }

  onUnmount() {
    this._abort = true;
  }

  template() {
    const id = this.props && this.props.params ? this.props.params.id : null;
    if (this.state.loading) {
      return this.html`
        <div>
          <div class="muted">Loading details for user ${utils.escapeHtml(id || '?')}...</div>
        </div>
      `;
    }
    if (this.state.error) {
      return this.html`
        <div>
          <div class="error">${utils.escapeHtml(this.state.error)}</div>
          <a href="#/users" data-router-link data-to="/users" class="btn" style="margin-top:.5rem;display:inline-block;">Back to users</a>
        </div>
      `;
    }
    const u = this.state.user || { id, name: 'Unknown' };
    return this.html`
      <div>
        <h3 style="margin:.25rem 0;">${utils.escapeHtml(u.name)}</h3>
        <div class="muted">ID: ${utils.escapeHtml(String(u.id))}</div>
        <div style="margin:.5rem 0;">Role: <strong>${utils.escapeHtml(u.role || '')}</strong></div>
        <p style="margin:.25rem 0;">${utils.escapeHtml(u.bio || '')}</p>
        <a href="#/users" data-router-link data-to="/users" class="btn" style="margin-top:.5rem;display:inline-block;background:#6c757d;">Back</a>
      </div>
    `;
  }
}
