import { defineComponent, utils } from '../index.js';

const UserDetails = defineComponent(({ html, useState, props }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  let abort = false;

  const onMount = () => {
    const id = props && props.params ? props.params.id : null;
    setTimeout(() => {
      if (abort) return;
      if (!id) {
        // No user selected: render a friendly placeholder and skip fetching
        setError(null);
        setUser(null);
        setLoading(false);
        return;
      }
      const profiles = {
        '1': { id: 1, name: 'Ada Lovelace', role: 'Mathematician', bio: 'Pioneer of computing and the first programmer.' },
        '2': { id: 2, name: 'Alan Turing', role: 'Computer Scientist', bio: 'Father of theoretical computer science and AI.' },
        '3': { id: 3, name: 'Grace Hopper', role: 'Rear Admiral / Computer Scientist', bio: 'Developed the first compiler and popularized COBOL.' }
      };
      const u = profiles[String(id)] || { id, name: `User #${id}`, role: 'Unknown', bio: 'Loaded lazily via router.' };
      setUser(u); setLoading(false);
    }, 500);
  };

  const onUnmount = () => { abort = true; };

  const render = () => {
    const id = props && props.params ? props.params.id : null;
    if (!id) {
      // No selection placeholder
      return html`<div class="muted">Select a user from the list to view details.</div>`;
    }
    if (loading) {
      return html`<div><div class="muted">Loading details for user ${utils.escapeHtml(id || '?')}...</div></div>`;
    }
    if (error) {
      return html`<div><div class="error">${utils.escapeHtml(error)}</div><a href="#/users" data-router-link data-to="/users" class="btn" style="margin-top:.5rem;display:inline-block;">Back to users</a></div>`;
    }
    const u = user || { id, name: 'Unknown' };
    return html`
      <div>
        <h3 style="margin:.25rem 0;">${utils.escapeHtml(u.name)}</h3>
        <div class="muted">ID: ${utils.escapeHtml(String(u.id))}</div>
        <div style="margin:.5rem 0;">Role: <strong>${utils.escapeHtml(u.role || '')}</strong></div>
        <p style="margin:.25rem 0;">${utils.escapeHtml(u.bio || '')}</p>
        <a href="#/users" data-router-link data-to="/users" class="btn" style="margin-top:.5rem;display:inline-block;background:#6c757d;">Back</a>
      </div>
    `;
  };

  return { render, onMount, onUnmount };
});

export default UserDetails;
