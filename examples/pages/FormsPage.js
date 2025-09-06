import { defineComponent, Forms, Security, Velvet, Button, TextField } from '../../index.js';

export const FormsPage = defineComponent((ctx) => {
  const { html, on, useState } = ctx;
  const { vs } = Velvet.useVelvet(ctx);
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

    const wrap = vs({ base: { maxWidth: '768px', margin: '0 auto', padding: '0.75rem 1rem' } });
    const card = vs({ base: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem' } });
    const grid = vs({ base: { display: 'grid', gap: '.75rem' } });
    const label = vs({ base: { display: 'block', fontSize: '.9rem', marginBottom: '.25rem' } });
    const input = vs({ base: { width: '100%', padding: '.55rem .7rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px' }, focus: { outline: 'none', borderColor: '#0ea5e9', boxShadow: '0 0 0 3px rgba(14,165,233,.2)' } });
    const row = vs({ base: { display: 'flex', gap: '.5rem', alignItems: 'center' } });
    const btn = vs({ base: { padding: '.55rem .8rem', borderRadius: '8px', background: '#0ea5e9', color: '#fff', border: '1px solid #0ea5e9', cursor: 'pointer' }, hover: { background: '#0284c7', borderColor: '#0284c7' } });
    const btnGhost = vs({ base: { padding: '.55rem .8rem', borderRadius: '8px', background: 'transparent', color: '#0ea5e9', border: '1px solid #0ea5e9', cursor: 'pointer' }, hover: { background: 'rgba(14,165,233,.08)' } });
    const notice = vs({ base: { marginTop: '.25rem', color: '#dc2626' } });
    const subGrid = vs({ base: { marginTop: '1rem', display: 'grid', gap: '1rem' } });
    const previewBox = vs({ base: { padding: '.5rem', border: '1px solid var(--border)', borderRadius: '8px', background: '#f8fafc' } });

    return html`
      <div class="${wrap}">
        <div class="${card}">
          <h2 style="margin:0 0 .75rem 0;">Forms + Security</h2>
          <div class="${grid}">
            <div>
              <label for="name" class="${label}">Name</label>
              <input id="name" name="name" class="${input}" value="${values.name || ''}" />
              ${touched.name && errors.name ? html`<div class="${notice}">${errors.name}</div>` : ''}
            </div>
            <div>
              <label for="email" class="${label}">Email</label>
              <input id="email" name="email" class="${input}" value="${values.email || ''}" />
              ${touched.email && errors.email ? html`<div class="${notice}">${errors.email}</div>` : ''}
            </div>
            <div>
              <label for="bio" class="${label}">Bio (supports limited HTML; preview is sanitized)</label>
              <textarea id="bio" name="bio" class="${input}" rows="4">${values.bio || ''}</textarea>
            </div>
            <div class="${row}">
              <button id="submit" class="${btn}" type="button">Submit</button>
              <button id="reset" class="${btnGhost}" type="button" ${dirty ? '' : 'disabled'}>Reset</button>
            </div>
          </div>
        </div>

        <div class="${subGrid}">
          <div class="${card}">
            <h3 style="margin:0 0 .5rem 0;">Sanitized Preview</h3>
            <div class="${previewBox}">
              ${sanitized}
            </div>
          </div>
          ${submitted ? html`
            <div class="${card}">
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
