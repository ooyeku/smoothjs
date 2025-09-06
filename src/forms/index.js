

/**
 * Executes a set of validators against specified values and returns an object containing validation errors.
 *
 * @param {Object} values - An object containing key-value pairs to validate.
 * @param {Object} [validators={}] - An object where keys correspond to fields in `values` and values are validator functions.
 *                                    Each validator function is called with the field value as the first argument and the entire
 *                                    `values` object as the second argument.
 * @return {Object} An object mapping field names to their validation error messages. If no errors are found, the object is empty.
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
 * Creates a form management object with associated state and handlers for form values, errors, and submission.
 *
 * @param {Object} initialValues - An object representing the initial values of the form fields. Defaults to an empty object.
 * @param {Object} validators - An object containing field-specific validation functions. Each key should match a field name and the value should be a validation function.
 * @return {Object} An object containing the form state and methods to manage the form:
 * - `values`: The current values of the form fields.
 * - `errors`: The current validation errors for the form fields.
 * - `touched`: An object indicating which fields have been interacted with.
 * - `dirty`: A boolean indicating whether any field values differ from their initial values.
 * - `submitted`: A boolean indicating whether the form has been submitted.
 * - `setField`: A function to update a single field's value.
 * - `setValues`: A function to update multiple field values.
 * - `validate`: A function to validate the current form values.
 * - `reset`: A function to reset the form to its initial state or new initial values.
 * - `handleChange`: A handler function to manage field value changes, typically bound to input events.
 * - `handleBlur`: A handler function to track field focus loss, typically bound to input blur events.
 * - `handleSubmit`: A function to handle form submission, with custom callbacks for valid and invalid states.
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
