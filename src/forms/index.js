
/**
 * Executes a set of validator functions against supplied values and collects errors.
 *
 * @param {Object} values - An object containing the values to be validated, typically keyed by field names.
 * @param {Object} [validators={}] - An object containing validator functions, where each key corresponds to a field and each value is a function.
 * @return {Object} - An object containing collected error messages for each field, keyed by the field name.
 */
function runValidators(values, validators = {}) {
  const errors = {};
  for (const [field, validator] of Object.entries(validators || {})) {
    try {
      const res = typeof validator === 'function' ? validator(values[field], values) : null;
      if (res) errors[field] = String(res);
    } catch (e) {
      errors[field] = String(e && e.message ? e.message : 'Invalid');
    }
  }
  return errors;
}

/**
 * Creates a form object with initialized state, validation mechanisms, and handlers for form operations.
 *
 * @param {Object} [initialValues={}] - An object defining initial values for the form fields.
 * @param {Object} [validators={}] - An object mapping field names to validation functions or rules.
 * @return {Object} The created form object with state, handlers, and utility methods to manage and validate form data.
 */
export function createForm(initialValues = {}, validators = {}) {
  const state = {
    initial: { ...(initialValues || {}) },
    values: { ...(initialValues || {}) },
    errors: {},
    touched: {},
    dirty: false,
    submitted: false
  };

  function computeDirty() {
    return Object.keys(state.values).some(k => state.values[k] !== state.initial[k]);
  }

  function setField(name, value) {
    state.values[name] = value;
    state.errors = { ...state.errors, ...runValidators(state.values, { [name]: validators[name] }) };
    state.dirty = computeDirty();
  }

  function setValues(next) {
    const patch = typeof next === 'function' ? next({ ...state.values }) : next;
    Object.assign(state.values, patch || {});
    state.errors = runValidators(state.values, validators);
    state.dirty = computeDirty();
  }

  function handleChange(e) {
    const target = e && e.target ? e.target : e;
    if (!target || !('name' in target)) return;
    const name = target.name;
    let value = target.type === 'checkbox' ? !!target.checked : target.value;
    setField(name, value);
  }

  function handleBlur(e) {
    const target = e && e.target ? e.target : e;
    if (!target || !('name' in target)) return;
    const name = target.name;
    state.touched[name] = true;
  }

  function validate() {
    state.errors = runValidators(state.values, validators);
    return Object.keys(state.errors).length === 0;
  }

  function reset(nextInitial) {
    if (nextInitial && typeof nextInitial === 'object') {
      state.initial = { ...nextInitial };
      state.values = { ...nextInitial };
    } else {
      state.values = { ...state.initial };
    }
    state.errors = {};
    state.touched = {};
    state.dirty = false;
    state.submitted = false;
  }

  function handleSubmit(onValid, onInvalid) {
    return async (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      state.submitted = true;
      const ok = validate();
      if (ok) {
        return onValid && onValid({ ...state.values });
      } else {
        return onInvalid && onInvalid({ ...state.errors }, { ...state.values });
      }
    };
  }

  return {
    get values() { return state.values; },
    get errors() { return state.errors; },
    get touched() { return state.touched; },
    get dirty() { return state.dirty; },
    get submitted() { return state.submitted; },
    setField,
    setValues,
    validate,
    reset,
    handleChange,
    handleBlur,
    handleSubmit
  };
}

export default { createForm };
