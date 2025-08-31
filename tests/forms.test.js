import { describe, it, expect, vi } from 'vitest';
import { createForm } from '../src/forms/index.js';

const required = (v) => (!v ? 'Required' : '');
const email = (v) => (v && /.+@.+\..+/.test(v) ? '' : 'Invalid email');

describe('Forms.createForm', () => {
  it('tracks values, touched, dirty and validates on change/submit', async () => {
    const form = createForm({ name: '', email: '' }, { name: required, email });
    expect(form.values.name).toBe('');
    expect(form.dirty).toBe(false);

    // change name
    form.handleChange({ target: { name: 'name', value: 'Ada', type: 'text' } });
    expect(form.values.name).toBe('Ada');
    expect(form.dirty).toBe(true);

    // blur email
    form.handleBlur({ target: { name: 'email' } });
    expect(form.touched.email).toBe(true);

    // submit invalid (email empty)
    const onValid = vi.fn();
    const onInvalid = vi.fn();
    await form.handleSubmit(onValid, onInvalid)({ preventDefault(){} });
    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();
    expect(form.errors.email).toBe('Invalid email');

    // fix email
    form.handleChange({ target: { name: 'email', value: 'ada@lovelace.org', type: 'text' } });
    await form.handleSubmit(onValid, onInvalid)({ preventDefault(){} });
    expect(onValid).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@lovelace.org' });
  });

  it('reset restores initial and clears state', () => {
    const f = createForm({ agree: false }, {});
    f.handleChange({ target: { name: 'agree', type: 'checkbox', checked: true } });
    expect(f.values.agree).toBe(true);
    f.reset();
    expect(f.values.agree).toBe(false);
    expect(f.dirty).toBe(false);
  });
});
