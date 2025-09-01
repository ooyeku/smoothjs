import { defineComponent, Forms, Security } from '../../index.js';

export const FormsPage = defineComponent(({ html, on, useState }) => {
  // validators
  const required = (v) => (!v ? 'Required' : '');
  const email = (v) => (v && /.+@.+\..+/.test(v) ? '' : 'Invalid email');

  const form = Forms.createForm({ name: '', email: '', bio: '' }, { name: required, email });

  const [preview, setPreview] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [ver, setVer] = useState(0); // force re-render on form changes

  on('input', '#name', (e) => { form.handleChange(e); setVer(v => v + 1); });
  on('input', '#email', (e) => { form.handleChange(e); setVer(v => v + 1); });
  on('input', '#bio', (e) => { form.handleChange(e); setPreview(e.target.value); setVer(v => v + 1); });
  on('blur', '#name', (e) => { form.handleBlur(e); setVer(v => v + 1); });
  on('blur', '#email', (e) => { form.handleBlur(e); setVer(v => v + 1); });
  on('click', '#submit', async (e) => {
    await form.handleSubmit(
      (values) => { setSubmitted(values); },
      () => { setVer(v => v + 1); }
    )(e);
  });
  on('click', '#reset', () => { form.reset(); setPreview(''); setSubmitted(null); setVer(v => v + 1); });

  const render = () => {
    const { values, errors, touched, dirty } = form || { values:{}, errors:{}, touched:{}, dirty:false };
    const sanitized = Security.sanitize(preview || '');
    return html`
      <div style="max-width:768px; margin:0 auto; padding: 0.75rem 1rem;">
        <div style="background: var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem;">
          <h2 style="margin:0 0 .75rem 0;">Forms + Security</h2>
          <div style="display:grid; gap:.75rem;">
            <div>
              <label for="name" style="display:block; font-size:.9rem; margin-bottom:.25rem;">Name</label>
              <input id="name" name="name" class="input" value="${values.name || ''}" />
              ${touched.name && errors.name ? html`<div class="notice" style="margin-top:.25rem; color:#dc2626;">${errors.name}</div>` : ''}
            </div>
            <div>
              <label for="email" style="display:block; font-size:.9rem; margin-bottom:.25rem;">Email</label>
              <input id="email" name="email" class="input" value="${values.email || ''}" />
              ${touched.email && errors.email ? html`<div class="notice" style="margin-top:.25rem; color:#dc2626;">${errors.email}</div>` : ''}
            </div>
            <div>
              <label for="bio" style="display:block; font-size:.9rem; margin-bottom:.25rem;">Bio (supports limited HTML; preview is sanitized)</label>
              <textarea id="bio" name="bio" class="input" rows="4">${values.bio || ''}</textarea>
            </div>
            <div class="row" style="display:flex; gap:.5rem; align-items:center;">
              <button id="submit" class="btn" type="button">Submit</button>
              <button id="reset" class="btn" type="button" ${dirty ? '' : 'disabled'}>Reset</button>
            </div>
          </div>
        </div>

        <div style="margin-top:1rem; display:grid; gap:1rem;">
          <div class="card" style="background: var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem;">
            <h3 style="margin:0 0 .5rem 0;">Sanitized Preview</h3>
            <div style="padding:.5rem; border:1px solid var(--border); border-radius:8px; background: #f8fafc;">
              ${sanitized}
            </div>
          </div>
          ${submitted ? html`
            <div class="card" style="background: var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem;">
              <h3 style="margin:0 0 .5rem 0;">Submitted Values</h3>
              <pre style="margin:0; font-size:.85rem;">${JSON.stringify(submitted, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  return { render };
});
